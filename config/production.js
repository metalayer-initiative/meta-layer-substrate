module.exports = {
  // Production-specific overrides
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || '0.0.0.0',
    cors: {
      origin: process.env.CORS_ORIGIN || 'https://metalayer.vercel.app',
      credentials: true,
    },
  },

  database: {
    url: process.env.DATABASE_URL,
    pool: {
      min: 5,
      max: 20,
    },
  },

  logging: {
    level: 'info',
    format: 'combined',
  },

  // Production features
  features: {
    mockData: false,
    autoLogin: false,
    debugMode: false,
  },

  // Security settings
  security: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    },
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }
  },

  // External services
  services: {
    fractal: {
      apiUrl: process.env.FRACTAL_API_URL,
      apiKey: process.env.FRACTAL_API_KEY,
    },
    solana: {
      network: process.env.SOLANA_NETWORK || 'mainnet-beta',
      rpcUrl: process.env.SOLANA_RPC_URL,
      walletPrivateKey: process.env.SOLANA_WALLET_PRIVATE_KEY,
      programId: process.env.SOLANA_PROGRAM_ID,
    },
    phala: {
      apiUrl: process.env.PHALA_API_URL,
      workerId: process.env.PHALA_WORKER_ID,
      apiKey: process.env.PHALA_API_KEY,
      clusterId: process.env.PHALA_CLUSTER_ID,
    },
    opa: {
      url: process.env.OPA_URL,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }
  }
}; 