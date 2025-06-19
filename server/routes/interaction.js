const express = require('express');
const router = express.Router();
const { logInteraction } = require('../controllers/interactionController');

router.post('/interaction/log', logInteraction);

module.exports = router;
