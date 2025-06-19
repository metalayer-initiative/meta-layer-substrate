const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

class PoHService {
  constructor() {
    this.fractalApiUrl = process.env.FRACTAL_API_URL || 'https://api.fractal.id';
    this.fractalApiKey = process.env.FRACTAL_API_KEY;
    this.verificationTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Initiate PoH verification
  async initiateVerification(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Create verification session with Fractal
      const verificationResponse = await axios.post(
        `${this.fractalApiUrl}/v1/verification/sessions`,
        {
          client_id: this.fractalApiKey,
          redirect_uri: `${process.env.BASE_URL}/poh/callback`,
          scope: 'identity',
          state: userId // Pass user ID in state
        },
        {
          headers: {
            'Authorization': `Bearer ${this.fractalApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const { session_id, verification_url } = verificationResponse.data;

      // Update user with verification session
      await prisma.user.update({
        where: { id: userId },
        data: {
          poh_status: 'pending',
          updated_at: new Date()
        }
      });

      return {
        sessionId: session_id,
        verificationUrl: verification_url,
        expiresIn: this.verificationTimeout
      };
    } catch (error) {
      console.error('PoH initiation error:', error);
      throw new Error('Failed to initiate verification');
    }
  }

  // Handle PoH callback
  async handleCallback(sessionId, state) {
    try {
      const userId = state; // User ID was passed in state

      // Verify session with Fractal
      const verificationResponse = await axios.get(
        `${this.fractalApiUrl}/v1/verification/sessions/${sessionId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.fractalApiKey}`
          }
        }
      );

      const { status, identity } = verificationResponse.data;

      let pohStatus = 'failed';
      if (status === 'approved' && identity) {
        pohStatus = 'verified';
      }

      // Update user PoH status
      await prisma.user.update({
        where: { id: userId },
        data: {
          poh_status: pohStatus,
          updated_at: new Date()
        }
      });

      // Log interaction
      await prisma.interaction.create({
        data: {
          user_id: userId,
          action_type: 'poh_verification',
          policy_applied: {
            status,
            identity: identity ? 'verified' : 'not_verified',
            timestamp: new Date().toISOString()
          },
          metadata: {
            sessionId,
            fractalStatus: status
          }
        }
      });

      return {
        userId,
        status: pohStatus,
        verified: pohStatus === 'verified'
      };
    } catch (error) {
      console.error('PoH callback error:', error);
      throw new Error('Verification failed');
    }
  }

  // Check PoH status
  async checkPoHStatus(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          poh_status: true,
          updated_at: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      return {
        userId: user.id,
        email: user.email,
        pohStatus: user.poh_status,
        verified: user.poh_status === 'verified',
        lastUpdated: user.updated_at
      };
    } catch (error) {
      console.error('PoH status check error:', error);
      throw new Error('Failed to check PoH status');
    }
  }

  // Re-verify PoH (for expired verifications)
  async reVerify(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Check if verification is expired (older than 1 year)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      if (user.updated_at < oneYearAgo) {
        // Initiate new verification
        return await this.initiateVerification(userId);
      } else {
        // Return current status
        return await this.checkPoHStatus(userId);
      }
    } catch (error) {
      console.error('PoH re-verification error:', error);
      throw new Error('Re-verification failed');
    }
  }

  // Get verification URL for frontend
  async getVerificationUrl(userId) {
    const verification = await this.initiateVerification(userId);
    return verification.verificationUrl;
  }

  // Batch check PoH status for multiple users
  async batchCheckPoHStatus(userIds) {
    try {
      const users = await prisma.user.findMany({
        where: {
          id: { in: userIds }
        },
        select: {
          id: true,
          email: true,
          poh_status: true,
          updated_at: true
        }
      });

      return users.map(user => ({
        userId: user.id,
        email: user.email,
        pohStatus: user.poh_status,
        verified: user.poh_status === 'verified',
        lastUpdated: user.updated_at
      }));
    } catch (error) {
      console.error('Batch PoH check error:', error);
      throw new Error('Failed to check PoH statuses');
    }
  }

  // Get verification statistics
  async getVerificationStats() {
    try {
      const stats = await prisma.user.groupBy({
        by: ['poh_status'],
        _count: {
          id: true
        }
      });

      return stats.reduce((acc, stat) => {
        acc[stat.poh_status] = stat._count.id;
        return acc;
      }, {});
    } catch (error) {
      console.error('PoH stats error:', error);
      throw new Error('Failed to get verification statistics');
    }
  }
}

module.exports = new PoHService(); 