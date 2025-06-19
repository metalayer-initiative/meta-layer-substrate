const express = require('express');
const router = express.Router();
const { checkPoH } = require('../controllers/pohController');
const sessionStore = require('../sessionStore');

// POST /auth/login → Simulate login
router.post('/login', (req, res) => {
  const mockSession = {
    userId: 'user-abc123',
    email: 'example@gmail.com',
    is_human: true
  };

  sessionStore.setSession(mockSession);
  res.json({
    message: 'Login successful (mock)',
    session: mockSession
  });
});

// GET /auth/me → Return session info
router.get('/me', (req, res) => {
  const currentSession = sessionStore.getSession();
  if (!currentSession) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json({ user: currentSession });
});

// POST /poh/check → Simulate Fractal ID PoH check
router.post('/check', checkPoH);

module.exports = router;