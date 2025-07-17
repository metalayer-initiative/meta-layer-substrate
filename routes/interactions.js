const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { evaluatePolicy } = require('../services/policy');
const { hashInteraction } = require('../services/hash');

const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const { user_id, action_type } = req.body;

  if (!user_id || !action_type) {
    return res.status(400).json({ error: 'Missing user_id or action_type' });
  }

  try {
    // Fetch the user and ensure they exist
    const user = await prisma.user.findUnique({ where: { id: user_id } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Load the community and its ruleset (assumes just one for now)
    const community = await prisma.community.findFirst();
    const ruleset = community?.ruleset;

    // Evaluate policy based on user's role and PoH status
    const policy_applied = evaluatePolicy(user, ruleset);

    // Hash the interaction details to simulate a Solana TX proof
    const interactionData = {
      user_id,
      action_type,
      policy_applied,
      timestamp: new Date().toISOString()
    };

    const block_tx_hash = hashInteraction(interactionData);

    // Create and save the interaction
    const interaction = await prisma.interaction.create({
      data: {
        user_id,
        action_type,
        policy_applied,
        block_tx_hash
      }
    });

    res.status(201).json(interaction);
  } catch (error) {
    console.error('Error creating interaction:', error);
    res.status(500).json({ error: 'Failed to log interaction' });
  }
});

module.exports = router;

// GET /interactions
router.get('/', async (req, res) => {
  try {
    const interactions = await prisma.interaction.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50,
    });
    res.json(interactions);
  } catch (error) {
    console.error('Error fetching interactions:', error);
    res.status(500).json({ error: 'Failed to fetch interactions' });
  }
});

