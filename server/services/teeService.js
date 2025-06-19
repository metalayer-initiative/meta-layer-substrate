const axios = require('axios');
const crypto = require('crypto');

class TEEService {
  constructor() {
    this.phalaApiUrl = process.env.PHALA_API_URL || 'https://api.phala.network';
    this.workerId = process.env.PHALA_WORKER_ID;
    this.apiKey = process.env.PHALA_API_KEY;
    this.clusterId = process.env.PHALA_CLUSTER_ID;
  }

  // Execute action in TEE
  async execute(action, user, context) {
    try {
      // Prepare execution payload
      const payload = {
        action: {
          type: action.type,
          payload: action.payload,
          timestamp: new Date().toISOString()
        },
        user: {
          id: user.id,
          poh_status: user.poh_status,
          role: user.role
        },
        context: {
          communityId: context.communityId,
          sessionId: context.sessionId,
          metadata: context.metadata || {}
        },
        security: {
          nonce: crypto.randomBytes(16).toString('hex'),
          signature: this.generateSignature(action, user, context)
        }
      };

      // Send to Phala TEE
      const response = await axios.post(
        `${this.phalaApiUrl}/v1/tee/execute`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'X-Worker-ID': this.workerId,
            'X-Cluster-ID': this.clusterId
          },
          timeout: 30000 // 30 second timeout
        }
      );

      const result = response.data;

      // Verify TEE response
      if (!this.verifyTEEResponse(result, payload)) {
        throw new Error('TEE response verification failed');
      }

      return {
        success: true,
        result: result.data,
        teeProof: result.proof,
        executionTime: result.executionTime
      };
    } catch (error) {
      console.error('TEE execution error:', error);
      
      // Fallback to local execution for non-critical operations
      if (this.isNonCriticalAction(action.type)) {
        return this.fallbackExecution(action, user, context);
      }
      
      throw new Error(`TEE execution failed: ${error.message}`);
    }
  }

  // Generate signature for TEE request
  generateSignature(action, user, context) {
    const data = {
      action: action.type,
      userId: user.id,
      timestamp: new Date().toISOString(),
      context: context.communityId || 'global'
    };

    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(data, Object.keys(data).sort()));
    return hash.digest('hex');
  }

  // Verify TEE response
  verifyTEEResponse(response, originalPayload) {
    try {
      // Check response structure
      if (!response.data || !response.proof || !response.executionTime) {
        return false;
      }

      // Verify proof (in production, this would verify cryptographic proof)
      if (!this.verifyProof(response.proof, originalPayload)) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('TEE response verification error:', error);
      return false;
    }
  }

  // Verify cryptographic proof
  verifyProof(proof, originalPayload) {
    try {
      // In production, this would verify the actual cryptographic proof
      // For now, we'll do basic validation
      if (!proof.signature || !proof.timestamp) {
        return false;
      }

      // Check if proof is recent (within 5 minutes)
      const proofTime = new Date(proof.timestamp);
      const now = new Date();
      const timeDiff = now.getTime() - proofTime.getTime();
      
      if (timeDiff > 5 * 60 * 1000) { // 5 minutes
        return false;
      }

      return true;
    } catch (error) {
      console.error('Proof verification error:', error);
      return false;
    }
  }

  // Check if action is non-critical (can fallback to local execution)
  isNonCriticalAction(actionType) {
    const nonCriticalActions = [
      'view_messages',
      'get_user_profile',
      'list_communities',
      'get_vault_balance'
    ];

    return nonCriticalActions.includes(actionType);
  }

  // Fallback execution for non-critical actions
  fallbackExecution(action, user, context) {
    console.log(`Fallback execution for action: ${action.type}`);
    
    return {
      success: true,
      result: {
        action: action.type,
        user: user.id,
        status: 'executed_locally',
        warning: 'TEE unavailable, executed locally'
      },
      teeProof: null,
      executionTime: 0,
      fallback: true
    };
  }

  // Execute sensitive operations (always use TEE)
  async executeSensitive(action, user, context) {
    const sensitiveActions = [
      'send_message',
      'join_community',
      'poh_verification',
      'vault_transaction',
      'policy_decision'
    ];

    if (!sensitiveActions.includes(action.type)) {
      throw new Error('Action is not marked as sensitive');
    }

    return await this.execute(action, user, context);
  }

  // Batch execute multiple actions
  async batchExecute(actions, user, context) {
    const results = [];

    for (const action of actions) {
      try {
        const result = await this.execute(action, user, context);
        results.push({
          actionId: action.id,
          success: true,
          result: result.result
        });
      } catch (error) {
        results.push({
          actionId: action.id,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  // Get TEE status
  async getTEEStatus() {
    try {
      const response = await axios.get(
        `${this.phalaApiUrl}/v1/tee/status`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'X-Worker-ID': this.workerId
          }
        }
      );

      return {
        available: true,
        workerId: this.workerId,
        clusterId: this.clusterId,
        status: response.data.status,
        uptime: response.data.uptime,
        version: response.data.version
      };
    } catch (error) {
      return {
        available: false,
        error: error.message
      };
    }
  }

  // Health check
  async healthCheck() {
    try {
      const status = await this.getTEEStatus();
      
      if (!status.available) {
        throw new Error('TEE not available');
      }

      // Test execution
      const testResult = await this.execute(
        { type: 'health_check', payload: {} },
        { id: 'test', poh_status: 'verified', role: 'system' },
        { communityId: 'test', sessionId: 'test' }
      );

      return {
        healthy: true,
        teeStatus: status,
        testResult: testResult.success
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }

  // Encrypt data for TEE
  encryptForTEE(data) {
    try {
      // In production, this would use proper encryption
      const encrypted = Buffer.from(JSON.stringify(data)).toString('base64');
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data for TEE');
    }
  }

  // Decrypt data from TEE
  decryptFromTEE(encryptedData) {
    try {
      // In production, this would use proper decryption
      const decrypted = Buffer.from(encryptedData, 'base64').toString();
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data from TEE');
    }
  }
}

module.exports = new TEEService(); 