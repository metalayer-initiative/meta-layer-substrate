const express = require('express');
const router = express.Router();
const { checkPoH } = require('../controllers/pohController');

router.post('/check', checkPoH);

module.exports = router;
