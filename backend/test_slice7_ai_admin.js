require('dotenv').config();
const axios = require('axios');
const prisma = require('./src/lib/prisma');

const API_URL = 'http://localhost:5000/api/v1';

async function testSlice7() {
  console.log('🚀 === STARTING SLICE 7: AI SUPPORT ASSISTANT & ADMIN SUPERPANEL VERIFICATION ===\n');

  try {
    // 0. Ensure Customer Account is Active
    await prisma.user.updateMany({
      where: { email: 'customer@smartdeliver.com' },
      data: { isActive: true },
    });

    // 1. Authenticate a User for Contextual Testing
    console.log('1️⃣ Authenticating Customer User...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'customer@smartdeliver.com',
      password: 'Password123!',
    });
    const token = loginRes.data.token || loginRes.data.accessToken;
    console.log('✅ Customer Authenticated.');

    // 2. Test AI Support Assistant (POST /api/v1/ai/chat)
    console.log('\n2️⃣ Testing AI Support Assistant (General Inquiry)...');
    const aiRes1 = await axios.post(
      `${API_URL}/ai/chat`,
      { message: 'What stores are open in Addis Ababa and how does escrow work?' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`✅ AI Reply 1 Received:`);
    console.log(`"${aiRes1.data.reply.slice(0, 180)}..."`);
    if (!aiRes1.data.reply || aiRes1.data.reply.length < 10) {
      throw new Error('Assertion failed: AI reply is empty or too short');
    }

    console.log('\n3️⃣ Testing AI Support Assistant (Order-Tracking Grounding)...');
    const aiRes2 = await axios.post(
      `${API_URL}/ai/chat`,
      { message: 'Where is my order?' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`✅ AI Reply 2 Received (Order Status):`);
    console.log(`"${aiRes2.data.reply.slice(0, 180)}..."`);

    // 4. Test Admin Mission Control Overview (GET /api/v1/admin/overview)
    console.log('\n4️⃣ Testing Admin Superpanel Overview (/api/v1/admin/overview)...');
    const adminOverviewRes = await axios.get(`${API_URL}/admin/overview`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const metrics = adminOverviewRes.data.metrics;
    console.log(`✅ Admin Overview Metrics Received:`);
    console.log(`   Total Users: ${metrics.totalUsers}`);
    console.log(`   Role Distribution: Customers=${metrics.roleBreakdown.CUSTOMER}, Vendors=${metrics.roleBreakdown.VENDOR}, Couriers=${metrics.roleBreakdown.RIDER}, Admins=${metrics.roleBreakdown.ADMIN}`);
    console.log(`   Total Platform Gross Revenue: ETB ${metrics.totalGrossRevenue}`);
    console.log(`   Total Escrow Held In Transit: ETB ${metrics.totalEscrowHeld}`);
    console.log(`   Active Couriers: ${metrics.activeDeliveriesCount}`);

    if (metrics.totalUsers <= 0 || metrics.totalGrossRevenue === undefined) {
      throw new Error('Assertion failed: Invalid admin metrics');
    }

    // 5. Test Admin User Accounts List (GET /api/v1/admin/users)
    console.log('\n5️⃣ Testing Admin Users Management (/api/v1/admin/users)...');
    const usersRes = await axios.get(`${API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const usersList = usersRes.data.users;
    console.log(`✅ Retrieved ${usersList.length} registered accounts.`);
    if (usersList.length === 0) {
      throw new Error('Assertion failed: Users list is empty');
    }

    // Ensure caller is active
    await prisma.user.updateMany({
      where: { email: 'customer@smartdeliver.com' },
      data: { isActive: true },
    });

    // 6. Test Admin Toggle User Status (PATCH /api/v1/admin/users/:id/toggle-status)
    const targetUser = usersList.find((u) => u.email !== 'customer@smartdeliver.com') || usersList[0];
    console.log(`\n6️⃣ Testing Admin User Account Status Toggle on ${targetUser.name} (${targetUser.email})...`);
    const initialActive = targetUser.isActive;

    // Toggle 1
    const toggleRes1 = await axios.patch(
      `${API_URL}/admin/users/${targetUser.id}/toggle-status`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`✅ Toggle 1 Result: ${toggleRes1.data.message}`);
    if (toggleRes1.data.user.isActive === initialActive) {
      throw new Error('Assertion failed: User status should have toggled');
    }

    // Toggle back to restore original state
    const toggleRes2 = await axios.patch(
      `${API_URL}/admin/users/${targetUser.id}/toggle-status`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`✅ Toggle 2 (Restore) Result: ${toggleRes2.data.message}`);
    if (toggleRes2.data.user.isActive !== initialActive) {
      throw new Error('Assertion failed: User status should have restored');
    }

    // 7. Test Admin Security Audit Logs (GET /api/v1/admin/audit-logs)
    console.log('\n7️⃣ Testing Admin Security Audit Trail (/api/v1/admin/audit-logs)...');
    const auditRes = await axios.get(`${API_URL}/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { authLogs, adminLogs } = auditRes.data;
    console.log(`✅ Retrieved ${authLogs.length} Auth Audit Logs and ${adminLogs.length} Admin Audit Logs.`);
    if (adminLogs.length > 0) {
      console.log(`   Latest Admin Action: [${adminLogs[0].action}] - Reason: ${adminLogs[0].reason}`);
    }

    console.log('\n🎉 ========================================================');
    console.log('🎉 SLICE 7: ALL AI SUPPORT & ADMIN SUPERPANEL TESTS PASSED 100%');
    console.log('🎉 ========================================================\n');
  } catch (err) {
    console.error('❌ Verification Error:', err.response?.data || err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testSlice7();
