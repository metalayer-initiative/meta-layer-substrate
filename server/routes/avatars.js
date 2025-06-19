const express = require('express');
const router = express.Router();
const avatarStore = require('../avatarStore');

// GET /avatars/active?communityId=comm-002
router.get('/active', (req, res) => {
  const { communityId } = req.query;
  if (!communityId) {
    return res.status(400).json({ error: 'communityId required' });
  }

  const activeAvatars = avatarStore.getActiveInCommunity(communityId);
  res.json({ active: activeAvatars });
});

module.exports = router;
