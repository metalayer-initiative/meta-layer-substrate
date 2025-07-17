const crypto = require('crypto');

function hashInteraction(interactionData) {
  const serialized = JSON.stringify(interactionData);
  const hash = crypto.createHash('sha256').update(serialized).digest('hex');
  return hash;
}

module.exports = { hashInteraction };
