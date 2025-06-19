// Simulated OPA decision engine
exports.enforcePolicy = (req, res) => {
    const { userId, communityId, actionType, payload } = req.body;
    if (!userId || !communityId || !actionType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    // Example rules logic: no spamming content longer than 200 chars
    const isAllowed = !(actionType === 'send_message' && payload.content.length > 200);
  
    const decision = {
      userId,
      communityId,
      actionType,
      allowed: isAllowed,
      reason: isAllowed ? 'Allowed by policy' : 'Blocked due to policy violation'
    };
  
    // Ideally, also store decision audit
    res.json(decision);
  };
  