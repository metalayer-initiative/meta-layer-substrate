exports.login = (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  // Simulate user login and session creation
  const user = {
    id: 'user-' + Math.random().toString(36).substr(2, 9),
    email,
    is_human: false,
    created_at: new Date().toISOString()
  };

  // In a real app, store in DB and return JWT or session token
  res.json({ message: 'Logged in', user });
};

exports.getSessionInfo = (req, res) => {
  // Placeholder — no session logic yet
  res.json({ user: null });
};
