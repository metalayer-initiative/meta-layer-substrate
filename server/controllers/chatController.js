// In-memory store for now
const chatMessages = [];

// POST /chat/message
exports.postMessage = (req, res) => {
  const { userId, communityId, content } = req.body;
  if (!userId || !communityId || !content) {
    return res.status(400).json({ error: 'userId, communityId & content are required' });
  }

  const msg = {
    id: `msg-${Date.now()}`,
    userId,
    communityId,
    content,
    created_at: new Date().toISOString()
  };
  chatMessages.push(msg);

  res.json({ message: 'Message sent', msg });
};

// GET /chat/history
exports.getChatHistory = (req, res) => {
  const { communityId } = req.query;
  if (!communityId) {
    return res.status(400).json({ error: 'communityId query is required' });
  }

  const msgs = chatMessages.filter(m => m.communityId === communityId);
  res.json({ communityId, messages: msgs });
};
