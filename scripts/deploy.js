#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class DeploymentManager {
  constructor() {
    this.environment = process.env.NODE_ENV || 'production';
    this.config = this.loadConfig();
  }

  // Load configuration based on environment
  loadConfig() {
    const configPath = path.join(__dirname, '../config', `${this.environment}.js`);
    if (fs.existsSync(configPath)) {
      return require(configPath);
    }
    return require('../config/default.js');
  }

  // Run deployment
  async deploy() {
    console.log(`🚀 Starting deployment for ${this.environment} environment...`);
    
    try {
      // 1. Validate environment
      await this.validateEnvironment();
      
      // 2. Install dependencies
      await this.installDependencies();
      
      // 3. Setup database
      await this.setupDatabase();
      
      // 4. Build frontend
      await this.buildFrontend();
      
      // 5. Run tests
      await this.runTests();
      
      // 6. Start services
      await this.startServices();
      
      console.log('✅ Deployment completed successfully!');
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      process.exit(1);
    }
  }

  // Validate environment variables
  async validateEnvironment() {
    console.log('🔍 Validating environment...');
    
    const requiredVars = [
      'DATABASE_URL',
      'JWT_SECRET',
      'SESSION_SECRET',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'FRACTAL_API_KEY',
      'SOLANA_RPC_URL',
      'SOLANA_WALLET_PRIVATE_KEY'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    console.log('✅ Environment validation passed');
  }

  // Install dependencies
  async installDependencies() {
    console.log('📦 Installing dependencies...');
    
    try {
      // Install root dependencies
      execSync('npm install', { stdio: 'inherit' });
      
      // Install server dependencies
      execSync('cd server && npm install', { stdio: 'inherit' });
      
      // Install client dependencies
      execSync('cd client && npm install', { stdio: 'inherit' });
      
      console.log('✅ Dependencies installed');
    } catch (error) {
      throw new Error(`Failed to install dependencies: ${error.message}`);
    }
  }

  // Setup database
  async setupDatabase() {
    console.log('🗄️ Setting up database...');
    
    try {
      // Generate Prisma client
      execSync('cd server && npx prisma generate', { stdio: 'inherit' });
      
      // Run migrations
      execSync('cd server && npx prisma migrate deploy', { stdio: 'inherit' });
      
      // Seed database
      execSync('node scripts/setup-db.js', { stdio: 'inherit' });
      
      console.log('✅ Database setup completed');
    } catch (error) {
      throw new Error(`Database setup failed: ${error.message}`);
    }
  }

  // Build frontend
  async buildFrontend() {
    console.log('🏗️ Building frontend...');
    
    try {
      execSync('cd client && npm run build', { stdio: 'inherit' });
      console.log('✅ Frontend built successfully');
    } catch (error) {
      throw new Error(`Frontend build failed: ${error.message}`);
    }
  }

  // Run tests
  async runTests() {
    console.log('🧪 Running tests...');
    
    try {
      // Run server tests
      execSync('cd server && npm test', { stdio: 'inherit' });
      
      // Run client tests
      execSync('cd client && npm test -- --watchAll=false', { stdio: 'inherit' });
      
      console.log('✅ All tests passed');
    } catch (error) {
      throw new Error(`Tests failed: ${error.message}`);
    }
  }

  // Start services
  async startServices() {
    console.log('🚀 Starting services...');
    
    try {
      // Start agent system
      execSync('node scripts/start-agents.js', { 
        stdio: 'inherit',
        detached: true 
      });
      
      // Start server
      execSync('cd server && npm start', { 
        stdio: 'inherit',
        detached: true 
      });
      
      console.log('✅ Services started');
    } catch (error) {
      throw new Error(`Failed to start services: ${error.message}`);
    }
  }

  // Health check
  async healthCheck() {
    console.log('🏥 Running health checks...');
    
    try {
      // Check server health
      const serverHealth = await this.checkServerHealth();
      
      // Check database health
      const dbHealth = await this.checkDatabaseHealth();
      
      // Check TEE health
      const teeHealth = await this.checkTEEHealth();
      
      const allHealthy = serverHealth && dbHealth && teeHealth;
      
      if (allHealthy) {
        console.log('✅ All health checks passed');
      } else {
        throw new Error('Health checks failed');
      }
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  }

  // Check server health
  async checkServerHealth() {
    try {
      const response = await fetch('http://localhost:3001/health');
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Check database health
  async checkDatabaseHealth() {
    try {
      execSync('cd server && npx prisma db execute --stdin <<< "SELECT 1"', { 
        stdio: 'pipe' 
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Check TEE health
  async checkTEEHealth() {
    try {
      const teeService = require('../server/services/teeService');
      const health = await teeService.healthCheck();
      return health.healthy;
    } catch (error) {
      return false;
    }
  }

  // Rollback deployment
  async rollback() {
    console.log('🔄 Rolling back deployment...');
    
    try {
      // Stop services
      execSync('pkill -f "node.*server"', { stdio: 'pipe' });
      execSync('pkill -f "node.*agents"', { stdio: 'pipe' });
      
      // Revert database migration
      execSync('cd server && npx prisma migrate reset --force', { stdio: 'inherit' });
      
      console.log('✅ Rollback completed');
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
    }
  }
}

// Run deployment if this file is executed directly
if (require.main === module) {
  const deployment = new DeploymentManager();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'deploy':
      deployment.deploy();
      break;
    case 'health':
      deployment.healthCheck();
      break;
    case 'rollback':
      deployment.rollback();
      break;
    default:
      console.log('Usage: node deploy.js [deploy|health|rollback]');
      process.exit(1);
  }
}

module.exports = DeploymentManager; 