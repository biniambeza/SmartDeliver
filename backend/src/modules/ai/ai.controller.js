const aiService = require('./ai.service');

/**
 * POST /api/v1/ai/chat
 * Ask AI support assistant
 */
exports.chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    const userId = req.user?.id || null;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message text is required' });
    }

    const reply = await aiService.chat(message.trim(), userId);

    res.status(200).json({
      success: true,
      reply,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
