const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { evaluatePolicy } = require('../services/policy');
const { hashInteraction } = require('../services/hash');

router.post('/', async (req, res) => {
  const { sender_id, community_id, content } = req.body;

  if (!sender_id || !community_id || !content) {
    return res.status(400).json({ error: 'Missing sender_id, community_id, or content' });
  }

  try {
    const sender = await prisma.user.findUnique({ where: { id: sender_id } });
    const community = await prisma.community.findUnique({ where: { id: community_id } });

    if (!sender) return res.status(404).json({ error: 'Sender not found' });
    if (!community) return res.status(404).json({ error: 'Community not found' });

    const policy_applied = evaluatePolicy(sender, community.ruleset);
    const timestamp = new Date();

    if (policy_applied === 'block') {
      const interactionData = {
        user_id: sender_id,
        action_type: 'send_message',
        policy_applied,
        timestamp: timestamp.toISOString()
      };
      const block_tx_hash = hashInteraction(interactionData);

      await prisma.interaction.create({
        data: {
          user_id: sender_id,
          action_type: 'send_message',
          policy_applied,
          block_tx_hash,
          timestamp
        }
      });

      return res.status(403).json({ error: 'Message blocked by policy', policy_applied });
    }

    const message = await prisma.message.create({
      data: {
        sender_id,
        community_id,
        content,
        timestamp
      }
    });

    const block_tx_hash = hashInteraction({ sender_id, content, policy_applied, timestamp: timestamp.toISOString() });

    await prisma.interaction.create({
      data: {
        user_id: sender_id,
        action_type: 'send_message',
        policy_applied,
        block_tx_hash,
        timestamp
      }
    });

    res.status(201).json({ message, policy_applied, block_tx_hash });
  } catch (error) {
    console.error('Error posting message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// GET /messages?community_id=optional
router.get('/', async (req, res) => {
    const { community_id } = req.query;
  
    try {
      const messages = await prisma.message.findMany({
        where: community_id ? { community_id } : {},
        include: {
          sender: {
            select: { id: true, email: true, role: true, PoH_status: true }
          },
          community: {
            select: { id: true, name: true }
          }
        },
        orderBy: {
          timestamp: 'desc'
        }
      });
  
      res.status(200).json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Failed to retrieve messages' });
    }
  });

  module.exports = router;
  