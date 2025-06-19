const express = require('express');
const router = express.Router();
const { checkPoH } = require('../controllers/pohController');

router.post('/check', checkPoH);

module.exports = router;
console.log(typeof checkPoH); // should log "function"