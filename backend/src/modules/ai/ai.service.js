const axios = require('axios');
const prisma = require('../../lib/prisma');

/**
 * SmartDeliver Knowledge Base & Live Grounding Engine
 */
class AIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
  }

  /**
   * Gather platform live context for the AI prompt
   */
  async getPlatformContext(userId) {
    let customerOrders = [];
    if (userId) {
      customerOrders = await prisma.order.findMany({
        where: { customerId: userId },
        take: 3,
        orderBy: { createdAt: 'desc' },
        include: {
          vendor: { select: { name: true } },
          delivery: { include: { rider: { select: { name: true, phone: true } } } },
          payment: true,
        },
      });
    }

    const vendors = await prisma.vendor.findMany({
      where: { isActive: true },
      take: 5,
      select: { name: true, category: true, address: true },
    });

    return {
      vendors,
      recentOrders: customerOrders.map((o) => ({
        id: o.id.slice(0, 8),
        vendor: o.vendor.name,
        status: o.status,
        total: Number(o.totalAmount),
        courier: o.delivery?.rider?.name || 'Not assigned yet',
        escrowHeld: o.payment?.isEscrowHeld ?? true,
      })),
    };
  }

  /**
   * Rule-based fallback response generator
   */
  generateFallbackResponse(message, context) {
    const lower = message.toLowerCase();

    if (lower.includes('track') || lower.includes('order') || lower.includes('where is')) {
      if (context.recentOrders.length > 0) {
        const latest = context.recentOrders[0];
        return `Your latest order #${latest.id} from **${latest.vendor}** is currently **${latest.status}**. Assigned courier: **${latest.courier}**. Total: **ETB ${latest.total}**. Escrow safety: **${latest.escrowHeld ? 'Held securely in escrow' : 'Released upon delivery'}**.`;
      }
      return 'You currently have no active orders. You can explore our verified Addis Ababa vendors to place an order, and track it live in real time!';
    }

    if (lower.includes('escrow') || lower.includes('payment') || lower.includes('chapa') || lower.includes('telebirr')) {
      return 'SmartDeliver uses an **Escrow Protection Protocol** powered by Chapa (Telebirr & CBE Birr). When you pay, funds are safely locked in escrow until the courier marks your items as delivered. Only then is payment released to the merchant.';
    }

    if (lower.includes('store') || lower.includes('restaurant') || lower.includes('vendor') || lower.includes('food')) {
      const vendorNames = context.vendors.map((v) => `• **${v.name}** (${v.category} - ${v.address})`).join('\n');
      return `Here are some popular open merchants in Addis Ababa:\n${vendorNames}\n\nYou can order fresh meals, groceries, and pharmacy supplies directly from the storefront!`;
    }

    if (lower.includes('courier') || lower.includes('rider') || lower.includes('delivery fee')) {
      return 'SmartDeliver charges a flat local delivery fee of **50 ETB** across Addis Ababa. Our verified couriers deliver on motorbikes equipped with real-time GPS tracking.';
    }

    return "Hello! I am your **SmartDeliver AI Assistant**. I can help you track your active deliveries, explore restaurants and stores in Addis Ababa, and answer questions about our Chapa Escrow payment system. How can I assist you today?";
  }

  /**
   * Chat with Gemini with live grounding
   */
  async chat(userMessage, userId) {
    const context = await this.getPlatformContext(userId);

    const systemPrompt = `You are SmartDeliver AI, a friendly, ultra-reliable customer service assistant for SmartDeliver, an on-demand multi-vendor delivery platform in Addis Ababa, Ethiopia.
Currency: Ethiopian Birr (ETB).
Flat delivery fee: 50 ETB.
Payment: Chapa Escrow (Telebirr, CBE Birr) where money is locked safely until courier marks delivery complete.

Live Platform Data:
Active Vendors: ${JSON.stringify(context.vendors)}
Customer's Recent Orders: ${JSON.stringify(context.recentOrders)}

Guidelines:
- If the customer asks about their order, use the live recent orders data.
- Be concise, warm, helpful, and use markdown formatting.
- Mention Ethiopian Birr (ETB) for any pricing.`;

    if (!this.apiKey || this.apiKey.includes('xxxx')) {
      return this.generateFallbackResponse(userMessage, context);
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: `${systemPrompt}\n\nCustomer question: ${userMessage}` },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 350,
        },
      };

      const response = await axios.post(url, payload, { timeout: 8000 });
      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text.trim();
      return this.generateFallbackResponse(userMessage, context);
    } catch (err) {
      console.warn('Gemini API call skipped or timed out, using fallback grounding engine:', err.message);
      return this.generateFallbackResponse(userMessage, context);
    }
  }
}

module.exports = new AIService();
