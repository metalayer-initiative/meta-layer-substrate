// communityStore.js
let selectedCommunities = {}; // { userId: communityId }

module.exports = {
  getSelected: (userId) => selectedCommunities[userId] || null,
  setSelected: (userId, communityId) => {
    selectedCommunities[userId] = communityId;
  },
};
