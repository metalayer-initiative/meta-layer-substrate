module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || 'localhost',
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    },
  },

  // Database configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/metalayer',
    pool: {
      min: 2,
      max: 10,
    },
  },

  // Authentication configuration
  auth: {
    sessionSecret: process.env.SESSION_SECRET || 'your-secret-key',
    jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret',
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Proof of Humanity configuration
  poh: {
    fractalApiUrl: process.env.FRACTAL_API_URL || 'https://api.fractal.id',
    fractalApiKey: process.env.FRACTAL_API_KEY,
    verificationTimeout: 5 * 60 * 1000, // 5 minutes
  },

  // Solana configuration
  solana: {
    network: process.env.SOLANA_NETWORK || 'devnet',
    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    walletPrivateKey: process.env.SOLANA_WALLET_PRIVATE_KEY,
  },

  // Policy configuration
  policy: {
    opaUrl: process.env.OPA_URL || 'http://localhost:8181',
    defaultRules: {
      maxMessageLength: 200,
      allowAnonymous: true,
      moderationLevel: 'light',
    },
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'combined',
  },

  // Environment
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
}; 