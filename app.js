const express = require('express');
const session = require('cookie-session');
const cors = require('cors');
const passport = require('passport');
require('dotenv').config();

const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json());
app.use(session({
  name: 'session',
  keys: [process.env.SESSION_SECRET],
  maxAge: 24 * 60 * 60 * 1000
}));
app.use(passport.initialize());
app.use(passport.session());

// --- Passport Setup ---
require('./services/passport');

// --- Routes ---
app.use('/auth', require('./routes/auth'));
app.use('/poh', require('./routes/poh'));
app.use('/communities', require('./routes/communities'));
app.use('/avatars', require('./routes/avatars'));
app.use('/chat', require('./routes/chat'));
app.use('/interaction', require('./routes/interaction'));
app.use('/policy', require('./routes/policy'));

// --- Health Check ---
app.get('/', (req, res) => res.send('API is live!'));

// --- Server Start ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
