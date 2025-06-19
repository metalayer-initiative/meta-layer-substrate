const express = require('express');
const router = express.Router();
const { selectCommunity, getCommunities } = require('../controllers/communitiesController');
const avatarStore = require('../avatarStore');

router.get('/', getCommunities);

router.post('/select', (req, res) => {
  const { userId, communityId } = req.body;
  if (!userId || !communityId) {
    return res.status(400).json({ error: 'Missing userId or communityId' });
  }

  avatarStore.setActive(userId, communityId);

  res.json({
    message: 'Community selected',
    userId,
    communityId
  });
});

module.exports = router;
