module.exports = {
  // Development-specific overrides
  server: {
    port: 3001,
    host: 'localhost',
    cors: {
      origin: 'http://localhost:3000',
      credentials: true,
    },
  },

  database: {
    url: 'postgresql://localhost:5432/metalayer_dev',
    pool: {
      min: 1,
      max: 5,
    },
  },

  logging: {
    level: 'debug',
    format: 'dev',
  },

  // Enable detailed error messages
  errorHandling: {
    showStack: true,
    showDetails: true,
  },

  // Development features
  features: {
    mockData: true,
    autoLogin: true,
    debugMode: true,
  },
}; 