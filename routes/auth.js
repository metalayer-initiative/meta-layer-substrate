const express = require('express');
const passport = require('passport');
const router = express.Router();
const { checkPoH } = require('../controllers/pohController');
const sessionStore = require('../services/sessionStore');

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    const user = req.user;
    req.session.user = user;
    res.json({ message: 'Google login successful', user });
  }
);

// Session info
router.get('/me', (req, res) => {
  const user = req.session.user || sessionStore.getSession();
  if (!user) return res.status(401).json({ error: 'Not logged in' });
  res.json({ user });
});

// Simulated login (for local testing)
router.post('/login', (req, res) => {
  const mockSession = {
    userId: 'user-abc123',
    email: 'example@gmail.com',
    is_human: true
  };
  sessionStore.setSession(mockSession);
  req.session.user = mockSession;
  res.json({ message: 'Login successful (mock)', session: mockSession });
});

// Simulated PoH
router.post('/check', checkPoH);

module.exports = router;

//test: http://localhost:3001/auth/google
