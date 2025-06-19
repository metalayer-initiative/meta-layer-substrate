// avatarStore.js
const activeAvatars = {};

module.exports = {
  setActive: (userId, communityId) => {
    activeAvatars[userId] = { userId, communityId, lastSeen: new Date().toISOString() };
  },
  getActiveInCommunity: (communityId) => {
    return Object.values(activeAvatars).filter(a => a.communityId === communityId);
  },
};
