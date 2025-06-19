const express = require('express');
const router = express.Router();
const { postMessage, getChatHistory } = require('../controllers/chatController');

// POST message
router.post('/message', postMessage);

// GET history (bonus, prepares for next)
router.get('/history', getChatHistory);

module.exports = router;
