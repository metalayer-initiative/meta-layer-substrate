const express = require('express');
const router = express.Router();
const { enforcePolicy } = require('../controllers/policyController');

router.post('/', enforcePolicy);

module.exports = router;
