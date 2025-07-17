const axios = require('axios');

exports.checkPoH = async (req, res) => {
  const { message, signature } = req.body;
  if (!message || !signature) {
    return res.status(400).json({ error: 'Missing message or signature' });
  }

  try {
    const response = await axios.get('https://credentials.fractal.id', {
      params: { message, signature }
    });

    const { credential, fractalId, approvedAt, validUntil } = response.data;
    const isUnique = credential?.includes('level:uniqueness');

    if (!isUnique) {
      return res.status(403).json({
        verified: false,
        reason: 'Credential does not meet uniqueness level'
      });
    }

    const now = Math.floor(Date.now() / 1000);
    const isValid = validUntil && validUntil > now;

    if (!isValid) {
      return res.status(403).json({
        verified: false,
        reason: 'Credential expired'
      });
    }

    return res.json({
      verified: true,
      level: 'uniqueness',
      fractalId,
      validUntil
    });

  } catch (err) {
    console.error('PoH check failed:', err.response?.data || err.message);
    return res.status(400).json({ error: 'Fractal PoH failed', details: err.response?.data });
  }
};
