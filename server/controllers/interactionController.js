const { logInteraction } = require('../services/dbService');

// POST /interaction/log
exports.logInteraction = async (req, res) => {
  const { userId, action, result, block_tx } = req.body;

  if (!userId || !action || !result) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const interaction = {
    id: 'log-' + Date.now(),
    userId,
    action,
    result,
    block_tx: block_tx || null,
    timestamp: new Date().toISOString()
  };

  try {
    const dbResponse = await logInteraction(interaction);
    res.json({ message: 'Interaction logged', log: interaction, db: dbResponse });
  } catch (err) {
    console.error('Logging failed:', err);
    res.status(500).json({ error: 'Failed to log interaction' });
  }
};
