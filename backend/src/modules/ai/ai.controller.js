const prisma = require('../../lib/prisma');
const { cacheGet, cacheSet } = require('../../lib/redis');

/**
 * POST /api/v1/ai/chat
 * Order-aware AI support chatbot.
 * Pre-feeds the customer's active order context to the LLM prompt,
 * so responses are relevant to their current delivery/order state.
 */
exports.chat = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { message, orderId } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    // 1. Gather order context (if orderId provided, or fetch latest active order)
    let orderContext = null;
    let targetOrderId = orderId;

    if (!targetOrderId) {
      // Find the customer's most recent non-delivered/non-cancelled order
      const latestOrder = await prisma.order.findFirst({
        where: {
          customerId: userId,
          status: { notIn: ['DELIVERED', 'CANCELLED'] },
        },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      });
      targetOrderId = latestOrder?.id || null;
    }

    if (targetOrderId) {
      orderContext = await prisma.order.findUnique({
        where: { id: targetOrderId },
        include: {
          vendor: { select: { name: true, category: true, address: true } },
          items: {
            include: { product: { select: { name: true, price: true } } },
          },
          payment: { select: { status: true, txRef: true, isEscrowHeld: true } },
          delivery: {
            select: {
              status: true,
              currentLat: true,
              currentLng: true,
              pickedUpAt: true,
              deliveredAt: true,
              rider: { select: { name: true, phone: true } },
            },
          },
        },
      });
    }

    // 2. Build contextual system prompt
    const systemPrompt = buildSystemPrompt(orderContext);

    // 3. Generate AI response (with circuit breaker fallback)
    let aiResponse;
    let tokensUsed = 0;

    try {
      const result = await callGeminiAPI(systemPrompt, message.trim());
      aiResponse = result.text;
      tokensUsed = result.tokensUsed || 0;
    } catch (aiError) {
      console.error('AI upstream error (circuit breaker fallback):', aiError.message);
      aiResponse = getFallbackResponse(message.trim(), orderContext);
    }

    // 4. Log AI usage for admin auditing
    await prisma.aiRequest.create({
      data: {
        userId,
        orderId: targetOrderId,
        message: message.trim().substring(0, 500),
        response: aiResponse.substring(0, 2000),
        tokensUsed,
      },
    });

    res.status(200).json({
      success: true,
      reply: aiResponse,
      orderId: targetOrderId,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/ai/usage
 * Admin endpoint: View AI token usage and cost metrics.
 */
exports.getUsageStats = async (req, res, next) => {
  try {
    const totalRequests = await prisma.aiRequest.count();

    const result = await prisma.aiRequest.aggregate({
      _sum: { tokensUsed: true },
      _avg: { tokensUsed: true },
    });

    const recentRequests = await prisma.aiRequest.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    res.status(200).json({
      success: true,
      stats: {
        totalRequests,
        totalTokensUsed: result._sum.tokensUsed || 0,
        avgTokensPerRequest: Math.round(result._avg.tokensUsed || 0),
      },
      recentRequests,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Helpers ────────────────────────────────────────────────

/**
 * Build a contextual system prompt injecting live order data.
 */
function buildSystemPrompt(orderContext) {
  let prompt = `You are SmartDeliver's AI Customer Support Assistant. You help customers with order tracking, delivery questions, payment status, and general platform usage.

Rules:
- Be concise, friendly, and professional.
- If you don't know something, say so honestly.
- Never share sensitive data like full payment references or rider phone numbers.
- Provide actionable answers when possible.
`;

  if (orderContext) {
    const items = orderContext.items
      .map((i) => `${i.quantity}x ${i.product.name} (${i.price} ETB)`)
      .join(', ');

    prompt += `
ACTIVE ORDER CONTEXT:
- Order ID: ${orderContext.id}
- Store: ${orderContext.vendor?.name || 'N/A'} (${orderContext.vendor?.category || ''})
- Items: ${items}
- Subtotal: ${orderContext.subtotal} ETB | Delivery Fee: ${orderContext.deliveryFee} ETB | Total: ${orderContext.totalAmount} ETB
- Order Status: ${orderContext.status}
- Delivery Address: ${orderContext.deliveryAddress}
`;

    if (orderContext.payment) {
      prompt += `- Payment Status: ${orderContext.payment.status} | Escrow Held: ${orderContext.payment.isEscrowHeld ? 'Yes' : 'Released'}\n`;
    }

    if (orderContext.delivery) {
      prompt += `- Delivery Status: ${orderContext.delivery.status}\n`;
      if (orderContext.delivery.rider) {
        prompt += `- Rider: ${orderContext.delivery.rider.name}\n`;
      }
      if (orderContext.delivery.currentLat && orderContext.delivery.currentLng) {
        prompt += `- Rider Location: (${orderContext.delivery.currentLat}, ${orderContext.delivery.currentLng})\n`;
      }
      if (orderContext.delivery.pickedUpAt) {
        prompt += `- Picked Up At: ${orderContext.delivery.pickedUpAt}\n`;
      }
      if (orderContext.delivery.deliveredAt) {
        prompt += `- Delivered At: ${orderContext.delivery.deliveredAt}\n`;
      }
    }
  } else {
    prompt += '\nNo active order context available for this customer.\n';
  }

  return prompt;
}

/**
 * Call Gemini API for text generation.
 * Falls through to fetch-based API call.
 */
async function callGeminiAPI(systemPrompt, userMessage) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userMessage }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 512,
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const text =
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    'I apologize, but I could not generate a response. Please try again.';

  const tokensUsed =
    (data.usageMetadata?.promptTokenCount || 0) +
    (data.usageMetadata?.candidatesTokenCount || 0);

  return { text, tokensUsed };
}

/**
 * Circuit-breaker fallback responses when upstream LLM is unavailable.
 */
function getFallbackResponse(message, orderContext) {
  const lowerMsg = message.toLowerCase();

  if (orderContext) {
    if (lowerMsg.includes('status') || lowerMsg.includes('where') || lowerMsg.includes('track')) {
      return `Your order is currently **${orderContext.status}**. ${
        orderContext.delivery?.rider
          ? `Rider ${orderContext.delivery.rider.name} is handling your delivery.`
          : 'A rider has not been assigned yet.'
      } You can track it in real-time from the order tracking screen.`;
    }

    if (lowerMsg.includes('pay') || lowerMsg.includes('refund') || lowerMsg.includes('escrow')) {
      return `Your payment status is **${orderContext.payment?.status || 'PENDING'}**. Funds are held in escrow until delivery is confirmed. If you need a refund, please contact our support team.`;
    }

    if (lowerMsg.includes('cancel')) {
      return `To cancel your order, go to "My Orders" and tap "Cancel" — this is available while the order is still in PENDING or PAID status. Once it's being prepared or en route, you'll need to contact support.`;
    }
  }

  if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('help')) {
    return "Hello! I'm SmartDeliver's AI assistant. I can help with order tracking, delivery status, payments, and general questions. How can I help you today?";
  }

  return "I'm currently experiencing high demand and can't fully process your request. Please try again in a moment, or contact our support team for immediate help.";
}
