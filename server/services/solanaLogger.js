const { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

class SolanaLogger {
  constructor() {
    this.connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    );
    this.network = process.env.SOLANA_NETWORK || 'devnet';
    this.walletPrivateKey = process.env.SOLANA_WALLET_PRIVATE_KEY;
    this.programId = new PublicKey(process.env.SOLANA_PROGRAM_ID || '11111111111111111111111111111111');
  }

  // Log interaction to Solana blockchain
  async logInteraction(interaction) {
    try {
      const { userId, actionType, communityId, payload, metadata } = interaction;

      // Create interaction hash
      const interactionHash = this.createInteractionHash(interaction);

      // Prepare transaction data
      const transactionData = {
        interactionHash,
        userId,
        actionType,
        communityId: communityId || null,
        timestamp: new Date().toISOString(),
        metadata: metadata || {}
      };

      // Send to Solana
      const txHash = await this.sendToSolana(transactionData);

      // Update interaction with block transaction hash
      await prisma.interaction.update({
        where: { id: interaction.id },
        data: {
          block_tx_hash: txHash
        }
      });

      return {
        success: true,
        txHash,
        interactionHash
      };
    } catch (error) {
      console.error('Solana logging error:', error);
      
      // Log to database even if Solana fails
      await this.logToDatabase(interaction);
      
      return {
        success: false,
        error: error.message,
        fallback: 'database_only'
      };
    }
  }

  // Create interaction hash
  createInteractionHash(interaction) {
    const data = {
      userId: interaction.userId,
      actionType: interaction.actionType,
      communityId: interaction.communityId,
      timestamp: interaction.timestamp || new Date().toISOString(),
      payload: interaction.payload || {}
    };

    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(data, Object.keys(data).sort()));
    return hash.digest('hex');
  }

  // Send data to Solana
  async sendToSolana(transactionData) {
    try {
      // Create a simple transaction (in production, this would be a custom program)
      const transaction = new Transaction();
      
      // Add instruction to log interaction
      const instruction = {
        programId: this.programId,
        keys: [],
        data: Buffer.from(JSON.stringify(transactionData))
      };
      
      transaction.add(instruction);

      // Sign and send transaction
      const signature = await this.connection.sendTransaction(transaction);
      
      // Wait for confirmation
      await this.connection.confirmTransaction(signature, 'confirmed');
      
      return signature;
    } catch (error) {
      console.error('Solana transaction error:', error);
      throw new Error(`Failed to send to Solana: ${error.message}`);
    }
  }

  // Log to database as fallback
  async logToDatabase(interaction) {
    try {
      await prisma.interaction.update({
        where: { id: interaction.id },
        data: {
          metadata: {
            ...interaction.metadata,
            solanaError: 'Blockchain logging failed, stored in database only',
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Database fallback logging error:', error);
    }
  }

  // Batch log multiple interactions
  async batchLogInteractions(interactions) {
    const results = [];
    
    for (const interaction of interactions) {
      try {
        const result = await this.logInteraction(interaction);
        results.push({ interactionId: interaction.id, ...result });
      } catch (error) {
        results.push({ 
          interactionId: interaction.id, 
          success: false, 
          error: error.message 
        });
      }
    }
    
    return results;
  }

  // Get interaction from blockchain
  async getInteractionFromBlockchain(txHash) {
    try {
      const transaction = await this.connection.getTransaction(txHash, {
        commitment: 'confirmed'
      });
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }
      
      // Parse transaction data
      const instruction = transaction.transaction.message.instructions[0];
      const data = JSON.parse(instruction.data.toString());
      
      return data;
    } catch (error) {
      console.error('Failed to get interaction from blockchain:', error);
      throw error;
    }
  }

  // Verify interaction hash
  async verifyInteractionHash(interactionId) {
    try {
      const interaction = await prisma.interaction.findUnique({
        where: { id: interactionId }
      });
      
      if (!interaction || !interaction.block_tx_hash) {
        return { verified: false, reason: 'No blockchain record' };
      }
      
      // Get from blockchain
      const blockchainData = await this.getInteractionFromBlockchain(interaction.block_tx_hash);
      
      // Create local hash
      const localHash = this.createInteractionHash({
        userId: interaction.user_id,
        actionType: interaction.action_type,
        communityId: interaction.community_id,
        timestamp: interaction.timestamp.toISOString(),
        payload: interaction.policy_applied || {}
      });
      
      const verified = blockchainData.interactionHash === localHash;
      
      return {
        verified,
        blockchainHash: blockchainData.interactionHash,
        localHash,
        txHash: interaction.block_tx_hash
      };
    } catch (error) {
      console.error('Hash verification error:', error);
      return { verified: false, reason: error.message };
    }
  }

  // Get blockchain statistics
  async getBlockchainStats() {
    try {
      const stats = await prisma.interaction.groupBy({
        by: ['action_type'],
        where: {
          NOT: { block_tx_hash: null }
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
      console.error('Blockchain stats error:', error);
      throw new Error('Failed to get blockchain statistics');
    }
  }

  // Check Solana connection
  async checkConnection() {
    try {
      const version = await this.connection.getVersion();
      const slot = await this.connection.getSlot();
      
      return {
        connected: true,
        network: this.network,
        version: version['solana-core'],
        currentSlot: slot
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message
      };
    }
  }

  // Get account balance
  async getAccountBalance(publicKey) {
    try {
      const balance = await this.connection.getBalance(new PublicKey(publicKey));
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Balance check error:', error);
      throw error;
    }
  }
}

module.exports = new SolanaLogger(); 