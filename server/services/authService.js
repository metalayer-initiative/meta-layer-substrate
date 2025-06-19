const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const axios = require('axios');

const prisma = new PrismaClient();

class AuthService {
  constructor() {
    this.googleClientId = process.env.GOOGLE_CLIENT_ID;
    this.googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    this.jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret';
    this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
  }

  // Generate Google OAuth URL
  generateGoogleAuthUrl() {
    const redirectUri = `${process.env.BASE_URL}/auth/google/callback`;
    const scope = 'email profile';
    
    const url = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${this.googleClientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scope)}&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    return url;
  }

  // Handle Google OAuth callback
  async handleGoogleCallback(code) {
    try {
      // Exchange code for tokens
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        client_id: this.googleClientId,
        client_secret: this.googleClientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.BASE_URL}/auth/google/callback`
      });

      const { access_token } = tokenResponse.data;

      // Get user info from Google
      const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      const { email, name, picture } = userInfoResponse.data;

      // Create or update user
      const user = await this.createOrUpdateUser({
        email,
        name,
        picture
      });

      // Create session
      const session = await this.createSession(user.id);

      return {
        user,
        session,
        token: session.token
      };
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw new Error('Authentication failed');
    }
  }

  // Create or update user
  async createOrUpdateUser(userData) {
    const { email, name, picture } = userData;

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        updated_at: new Date()
      },
      create: {
        email,
        poh_status: 'pending',
        role: 'user'
      }
    });

    // Create vault if it doesn't exist
    await prisma.vault.upsert({
      where: { user_id: user.id },
      update: {},
      create: {
        user_id: user.id,
        reward_balance: 0,
        reputation_score: 0
      }
    });

    return user;
  }

  // Create session
  async createSession(userId) {
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + this.sessionTimeout);

    const session = await prisma.session.create({
      data: {
        user_id: userId,
        token,
        expires_at: expiresAt
      }
    });

    return session;
  }

  // Generate secure token
  generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Verify session token
  async verifySession(token) {
    const session = await prisma.session.findFirst({
      where: {
        token,
        expires_at: { gt: new Date() }
      },
      include: {
        user: {
          include: {
            vault: true
          }
        }
      }
    });

    return session;
  }

  // Get user by session token
  async getUserByToken(token) {
    const session = await this.verifySession(token);
    return session?.user || null;
  }

  // Invalidate session
  async invalidateSession(token) {
    await prisma.session.deleteMany({
      where: { token }
    });
  }

  // Clean expired sessions
  async cleanExpiredSessions() {
    await prisma.session.deleteMany({
      where: {
        expires_at: { lt: new Date() }
      }
    });
  }

  // Generate JWT for API access
  generateJWT(user) {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        pohStatus: user.poh_status
      },
      this.jwtSecret,
      { expiresIn: '24h' }
    );
  }

  // Verify JWT
  verifyJWT(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      return null;
    }
  }
}

module.exports = new AuthService(); 