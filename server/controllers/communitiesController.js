// controllers/communitiesController.js

// Temporary in-memory store
let selectedByUser = {}; // e.g. { "user-abc123": "comm-002" }

exports.getCommunities = (req, res) => {
  const communities = [
    { id: 'comm-001', name: 'Public Square', ruleset: { allowAnonymous: true, moderation: 'light' } },
    { id: 'comm-002', name: 'Governance Circle', ruleset: { allowAnonymous: false, moderation: 'strict' } }
  ];
  res.json({ communities });
};

exports.selectCommunity = (req, res) => {
  const { userId, communityId } = req.body;
  if (!userId || !communityId) {
    return res.status(400).json({ error: 'userId and communityId required' });
  }
  selectedByUser[userId] = communityId;
  res.json({ message: 'Community selected', userId, communityId });
};

exports.getSelectedCommunity = (req, res) => {
  const { userId } = req.params;
  const communityId = selectedByUser[userId];
  if (!communityId) {
    return res.status(404).json({ error: 'No community selected for this user' });
  }
  res.json({ userId, communityId });
};
