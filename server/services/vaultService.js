const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class VaultService {
  constructor() {
    this.reputationMultipliers = {
      message_sent: 1,
      message_liked: 2,
      community_joined: 5,
      poh_verified: 10,
      helpful_action: 3,
      moderation_action: 5
    };

    this.rewardRates = {
      message_sent: 0.1,
      message_liked: 0.2,
      community_joined: 1.0,
      poh_verified: 5.0,
      helpful_action: 0.5,
      moderation_action: 1.0
    };
  }

  // Get user vault
  async getUserVault(userId) {
    try {
      const vault = await prisma.vault.findUnique({
        where: { user_id: userId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              poh_status: true,
              role: true
            }
          }
        }
      });

      if (!vault) {
        throw new Error('Vault not found');
      }

      return vault;
    } catch (error) {
      console.error('Get vault error:', error);
      throw error;
    }
  }

  // Add reputation points
  async addReputation(userId, action, points = null) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { vault: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Only verified humans can earn reputation
      if (user.poh_status !== 'verified') {
        throw new Error('Only verified humans can earn reputation');
      }

      // Calculate points if not provided
      if (points === null) {
        points = this.reputationMultipliers[action] || 1;
      }

      // Update vault
      const updatedVault = await prisma.vault.update({
        where: { user_id: userId },
        data: {
          reputation_score: {
            increment: points
          }
        }
      });

      // Log reputation action
      await prisma.interaction.create({
        data: {
          user_id: userId,
          action_type: 'reputation_earned',
          policy_applied: {
            action,
            points,
            newTotal: updatedVault.reputation_score,
            timestamp: new Date().toISOString()
          },
          metadata: {
            vaultAction: 'reputation_added',
            points
          }
        }
      });

      return updatedVault;
    } catch (error) {
      console.error('Add reputation error:', error);
      throw error;
    }
  }

  // Add rewards
  async addRewards(userId, action, amount = null) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { vault: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Only verified humans can earn rewards
      if (user.poh_status !== 'verified') {
        throw new Error('Only verified humans can earn rewards');
      }

      // Calculate amount if not provided
      if (amount === null) {
        amount = this.rewardRates[action] || 0.1;
      }

      // Update vault
      const updatedVault = await prisma.vault.update({
        where: { user_id: userId },
        data: {
          reward_balance: {
            increment: amount
          }
        }
      });

      // Log reward action
      await prisma.interaction.create({
        data: {
          user_id: userId,
          action_type: 'reward_earned',
          policy_applied: {
            action,
            amount,
            newBalance: updatedVault.reward_balance,
            timestamp: new Date().toISOString()
          },
          metadata: {
            vaultAction: 'reward_added',
            amount
          }
        }
      });

      return updatedVault;
    } catch (error) {
      console.error('Add rewards error:', error);
      throw error;
    }
  }

  // Deduct rewards
  async deductRewards(userId, amount, reason) {
    try {
      const vault = await prisma.vault.findUnique({
        where: { user_id: userId }
      });

      if (!vault) {
        throw new Error('Vault not found');
      }

      if (vault.reward_balance < amount) {
        throw new Error('Insufficient reward balance');
      }

      // Update vault
      const updatedVault = await prisma.vault.update({
        where: { user_id: userId },
        data: {
          reward_balance: {
            decrement: amount
          }
        }
      });

      // Log deduction
      await prisma.interaction.create({
        data: {
          user_id: userId,
          action_type: 'reward_deducted',
          policy_applied: {
            reason,
            amount,
            newBalance: updatedVault.reward_balance,
            timestamp: new Date().toISOString()
          },
          metadata: {
            vaultAction: 'reward_deducted',
            amount,
            reason
          }
        }
      });

      return updatedVault;
    } catch (error) {
      console.error('Deduct rewards error:', error);
      throw error;
    }
  }

  // Get vault statistics
  async getVaultStats() {
    try {
      const stats = await prisma.vault.aggregate({
        _count: { id: true },
        _sum: {
          reward_balance: true,
          reputation_score: true
        },
        _avg: {
          reward_balance: true,
          reputation_score: true
        }
      });

      return {
        totalVaults: stats._count.id,
        totalRewards: stats._sum.reward_balance || 0,
        totalReputation: stats._sum.reputation_score || 0,
        averageRewards: stats._avg.reward_balance || 0,
        averageReputation: stats._avg.reputation_score || 0
      };
    } catch (error) {
      console.error('Vault stats error:', error);
      throw error;
    }
  }

  // Get top users by reputation
  async getTopUsersByReputation(limit = 10) {
    try {
      const users = await prisma.vault.findMany({
        take: limit,
        orderBy: {
          reputation_score: 'desc'
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              poh_status: true,
              role: true
            }
          }
        }
      });

      return users;
    } catch (error) {
      console.error('Get top users error:', error);
      throw error;
    }
  }

  // Get top users by rewards
  async getTopUsersByRewards(limit = 10) {
    try {
      const users = await prisma.vault.findMany({
        take: limit,
        orderBy: {
          reward_balance: 'desc'
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              poh_status: true,
              role: true
            }
          }
        }
      });

      return users;
    } catch (error) {
      console.error('Get top users error:', error);
      throw error;
    }
  }

  // Process automatic rewards for actions
  async processActionRewards(userId, action, metadata = {}) {
    try {
      const results = {};

      // Add reputation
      try {
        const reputationResult = await this.addReputation(userId, action);
        results.reputation = {
          success: true,
          points: this.reputationMultipliers[action] || 1,
          newTotal: reputationResult.reputation_score
        };
      } catch (error) {
        results.reputation = {
          success: false,
          error: error.message
        };
      }

      // Add rewards
      try {
        const rewardResult = await this.addRewards(userId, action);
        results.rewards = {
          success: true,
          amount: this.rewardRates[action] || 0.1,
          newBalance: rewardResult.reward_balance
        };
      } catch (error) {
        results.rewards = {
          success: false,
          error: error.message
        };
      }

      return results;
    } catch (error) {
      console.error('Process action rewards error:', error);
      throw error;
    }
  }

  // Create vault for new user
  async createVault(userId) {
    try {
      const vault = await prisma.vault.create({
        data: {
          user_id: userId,
          reward_balance: 0,
          reputation_score: 0
        }
      });

      return vault;
    } catch (error) {
      console.error('Create vault error:', error);
      throw error;
    }
  }

  // Reset vault (admin only)
  async resetVault(userId) {
    try {
      const vault = await prisma.vault.update({
        where: { user_id: userId },
        data: {
          reward_balance: 0,
          reputation_score: 0
        }
      });

      // Log reset action
      await prisma.interaction.create({
        data: {
          user_id: userId,
          action_type: 'vault_reset',
          policy_applied: {
            reason: 'Admin reset',
            timestamp: new Date().toISOString()
          },
          metadata: {
            vaultAction: 'reset',
            adminAction: true
          }
        }
      });

      return vault;
    } catch (error) {
      console.error('Reset vault error:', error);
      throw error;
    }
  }
}

module.exports = new VaultService(); 