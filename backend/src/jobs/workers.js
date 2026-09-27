const { Queue, Worker } = require('bullmq');
const { redis } = require('../lib/redis');

// ─── Queue Definitions ──────────────────────────────────────

let emailQueue = null;
let payoutQueue = null;

const queueConnection = redis
  ? { connection: redis.duplicate() }
  : null;

if (queueConnection) {
  emailQueue = new Queue('email', queueConnection);
  payoutQueue = new Queue('payout', queueConnection);
  console.log('📬 BullMQ: Email and Payout queues initialized');
}

// ─── Email Worker ────────────────────────────────────────────

function startEmailWorker() {
  if (!redis) {
    console.warn('⚠️  BullMQ: Email worker not started (Redis unavailable)');
    return null;
  }

  const worker = new Worker(
    'email',
    async (job) => {
      const { to, subject, html, type } = job.data;
      console.log(`📧 Processing ${type} email to ${to}: "${subject}"`);

      // Use Nodemailer if SMTP is configured, otherwise log
      if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: process.env.EMAIL_FROM || 'SmartDeliver <no-reply@smartdeliver.com>',
          to,
          subject,
          html,
        });

        console.log(`✅ Email sent to ${to}`);
      } else {
        console.log(`📧 [DEV] Email simulated — To: ${to}, Subject: ${subject}`);
        console.log(`   Body preview: ${html?.substring(0, 100)}...`);
      }
    },
    {
      connection: redis.duplicate(),
      concurrency: 3,
      limiter: {
        max: 10,
        duration: 60000,
      },
    }
  );

  worker.on('completed', (job) => {
    console.log(`✅ Email job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Email job ${job?.id} failed:`, err.message);
  });

  console.log('📬 BullMQ: Email worker started');
  return worker;
}

// ─── Payout Worker ───────────────────────────────────────────

function startPayoutWorker() {
  if (!redis) {
    console.warn('⚠️  BullMQ: Payout worker not started (Redis unavailable)');
    return null;
  }

  const worker = new Worker(
    'payout',
    async (job) => {
      const { orderId, vendorId, amount } = job.data;
      console.log(`💰 Processing payout for order ${orderId}: ${amount} ETB to vendor ${vendorId}`);

      // In production, this would call a payout API or update a vendor balance ledger
      const prisma = require('../lib/prisma');

      await prisma.payoutRecord.create({
        data: {
          orderId,
          vendorId,
          amount,
          status: 'COMPLETED',
          processedAt: new Date(),
        },
      });

      console.log(`✅ Payout recorded for order ${orderId}`);
    },
    {
      connection: redis.duplicate(),
      concurrency: 2,
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    }
  );

  worker.on('completed', (job) => {
    console.log(`✅ Payout job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Payout job ${job?.id} failed (moving to DLQ):`, err.message);
  });

  console.log('💰 BullMQ: Payout worker started');
  return worker;
}

// ─── Queue Helpers ───────────────────────────────────────────

/**
 * Enqueue an OTP verification email.
 */
async function enqueueOtpEmail(to, otp, name) {
  if (!emailQueue) {
    console.log(`📧 [DEV] OTP for ${to}: ${otp}`);
    return;
  }

  await emailQueue.add('otp-email', {
    type: 'OTP',
    to,
    subject: 'SmartDeliver — Your Verification Code',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #F5B820;">SmartDeliver</h2>
        <p>Hello ${name},</p>
        <p>Your verification code is:</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 16px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111;">${otp}</span>
        </div>
        <p style="color: #6b7280; font-size: 14px;">This code expires in 10 minutes. Do not share it with anyone.</p>
      </div>
    `,
  });
}

/**
 * Enqueue a password reset email.
 */
async function enqueuePasswordResetEmail(to, resetUrl, name) {
  if (!emailQueue) {
    console.log(`📧 [DEV] Password reset for ${to}: ${resetUrl}`);
    return;
  }

  await emailQueue.add('reset-email', {
    type: 'PASSWORD_RESET',
    to,
    subject: 'SmartDeliver — Reset Your Password',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #F5B820;">SmartDeliver</h2>
        <p>Hello ${name},</p>
        <p>You requested a password reset. Click the button below:</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetUrl}" style="background: #F5B820; color: #111; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
}

/**
 * Enqueue a payout processing job.
 */
async function enqueuePayoutJob(orderId, vendorId, amount) {
  if (!payoutQueue) {
    console.log(`💰 [DEV] Payout job for order ${orderId}: ${amount} ETB`);
    return;
  }

  await payoutQueue.add('process-payout', {
    orderId,
    vendorId,
    amount: parseFloat(amount),
  });
}

module.exports = {
  emailQueue,
  payoutQueue,
  startEmailWorker,
  startPayoutWorker,
  enqueueOtpEmail,
  enqueuePasswordResetEmail,
  enqueuePayoutJob,
};
