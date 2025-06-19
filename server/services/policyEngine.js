const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

class PolicyEngine {
  constructor() {
    this.opaUrl = process.env.OPA_URL || 'http://localhost:8181';
    this.defaultPolicies = {
      public_square: {
        allowAnonymous: true,
        moderation: 'light',
        maxMessageLength: 500,
        allowedActions: ['send_message', 'join_community', 'view_messages'],
        restrictions: {
          spam: { maxMessagesPerMinute: 5 },
          content: { forbiddenWords: [] }
        }
      },
      governance_circle: {
        allowAnonymous: false,
        moderation: 'strict',
        maxMessageLength: 1000,
        allowedActions: ['send_message', 'join_community', 'view_messages', 'vote'],
        restrictions: {
          spam: { maxMessagesPerMinute: 3 },
          content: { forbiddenWords: ['spam', 'offensive'] },
          poh_required: true
        }
      }
    };
  }

  // Evaluate policy for user action
  async evaluatePolicy(user, action, communityId, payload = {}) {
    try {
      // Get community ruleset
      const community = await prisma.community.findUnique({
        where: { id: communityId }
      });

      if (!community) {
        throw new Error('Community not found');
      }

      // Merge community ruleset with default policies
      const policy = this.mergePolicies(community.ruleset, this.defaultPolicies[community.name] || {});

      // Prepare input for OPA
      const input = {
        user: {
          id: user.id,
          email: user.email,
          poh_status: user.poh_status,
          role: user.role
        },
        action: {
          type: action,
          payload,
          timestamp: new Date().toISOString()
        },
        community: {
          id: community.id,
          name: community.name,
          ruleset: policy
        },
        context: {
          userReputation: user.vault?.reputation_score || 0,
          userBalance: user.vault?.reward_balance || 0
        }
      };

      // Send to OPA for evaluation
      const opaResponse = await axios.post(`${this.opaUrl}/v1/data/metalayer/policy`, {
        input
      });

      const decision = opaResponse.data.result;

      // Log policy decision
      await this.logPolicyDecision(user.id, communityId, action, decision, input);

      return {
        allowed: decision.allow || false,
        reason: decision.reason || 'Policy evaluation completed',
        restrictions: decision.restrictions || [],
        metadata: decision.metadata || {}
      };
    } catch (error) {
      console.error('Policy evaluation error:', error);
      
      // Fallback to basic policy check
      return this.fallbackPolicyCheck(user, action, communityId, payload);
    }
  }

  // Fallback policy check when OPA is unavailable
  fallbackPolicyCheck(user, action, communityId, payload) {
    // Basic checks
    const checks = {
      poh_required: () => {
        if (payload.requirePoh && user.poh_status !== 'verified') {
          return { allowed: false, reason: 'Proof of Humanity required' };
        }
        return { allowed: true };
      },
      message_length: () => {
        if (action === 'send_message' && payload.content) {
          const maxLength = payload.maxLength || 500;
          if (payload.content.length > maxLength) {
            return { allowed: false, reason: `Message too long (max ${maxLength} characters)` };
          }
        }
        return { allowed: true };
      },
      spam_protection: () => {
        // Basic spam check - in production, this would be more sophisticated
        if (action === 'send_message' && payload.content) {
          const spamWords = ['spam', 'buy now', 'click here'];
          const hasSpam = spamWords.some(word => 
            payload.content.toLowerCase().includes(word)
          );
          if (hasSpam) {
            return { allowed: false, reason: 'Spam detected' };
          }
        }
        return { allowed: true };
      }
    };

    // Run all checks
    for (const [checkName, checkFn] of Object.entries(checks)) {
      const result = checkFn();
      if (!result.allowed) {
        return result;
      }
    }

    return { allowed: true, reason: 'Basic policy check passed' };
  }

  // Merge policies
  mergePolicies(customPolicy, defaultPolicy) {
    return {
      ...defaultPolicy,
      ...customPolicy,
      restrictions: {
        ...defaultPolicy.restrictions,
        ...customPolicy.restrictions
      }
    };
  }

  // Log policy decision
  async logPolicyDecision(userId, communityId, action, decision, input) {
    try {
      await prisma.interaction.create({
        data: {
          user_id: userId,
          community_id: communityId,
          action_type: action,
          policy_applied: {
            decision,
            input: {
              user: { id: input.user.id, poh_status: input.user.poh_status },
              action: input.action,
              community: { id: input.community.id }
            },
            timestamp: new Date().toISOString()
          },
          metadata: {
            policyEngine: 'OPA',
            version: '1.0'
          }
        }
      });
    } catch (error) {
      console.error('Failed to log policy decision:', error);
    }
  }

  // Create community policy
  async createCommunityPolicy(communityId, policy) {
    try {
      const updatedCommunity = await prisma.community.update({
        where: { id: communityId },
        data: {
          ruleset: policy
        }
      });

      return updatedCommunity.ruleset;
    } catch (error) {
      console.error('Failed to create community policy:', error);
      throw new Error('Policy creation failed');
    }
  }

  // Get policy statistics
  async getPolicyStats(communityId) {
    try {
      const stats = await prisma.interaction.groupBy({
        by: ['action_type'],
        where: {
          community_id: communityId,
          policy_applied: {
            path: ['decision', 'allow'],
            equals: false
          }
        },
        _count: {
          id: true
        }
      });

      return stats.reduce((acc, stat) => {
        acc[stat.action_type] = stat._count.id;
        return acc;
      }, {});
    } catch (error) {
      console.error('Policy stats error:', error);
      throw new Error('Failed to get policy statistics');
    }
  }

  // Validate policy format
  validatePolicy(policy) {
    const requiredFields = ['allowAnonymous', 'moderation', 'maxMessageLength'];
    const missingFields = requiredFields.filter(field => !(field in policy));

    if (missingFields.length > 0) {
      throw new Error(`Missing required policy fields: ${missingFields.join(', ')}`);
    }

    return true;
  }

  // Get default policy template
  getDefaultPolicyTemplate() {
    return {
      allowAnonymous: true,
      moderation: 'light',
      maxMessageLength: 500,
      allowedActions: ['send_message', 'join_community', 'view_messages'],
      restrictions: {
        spam: { maxMessagesPerMinute: 5 },
        content: { forbiddenWords: [] }
      }
    };
  }
}

module.exports = new PolicyEngine(); 