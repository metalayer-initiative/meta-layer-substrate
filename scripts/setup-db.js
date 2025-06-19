#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient();

async function setupDatabase() {
  console.log('Setting up database...');
  
  try {
    // Generate Prisma client
    console.log('Generating Prisma client...');
    const { execSync } = require('child_process');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Run migrations
    console.log('Running database migrations...');
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
    
    // Seed database with initial data
    console.log('Seeding database...');
    await seedDatabase();
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function seedDatabase() {
  // Add initial communities
  const communities = [
    {
      id: 'comm-001',
      name: 'Public Square',
      description: 'A general discussion space for all verified users',
      ruleset: {
        allowAnonymous: true,
        moderation: 'light',
        maxMessageLength: 500
      }
    },
    {
      id: 'comm-002',
      name: 'Governance Circle',
      description: 'A space for governance discussions and voting',
      ruleset: {
        allowAnonymous: false,
        moderation: 'strict',
        maxMessageLength: 1000
      }
    }
  ];

  for (const community of communities) {
    try {
      await prisma.community.upsert({
        where: { id: community.id },
        update: community,
        create: community
      });
      console.log(`Community ${community.name} created/updated`);
    } catch (error) {
      console.log(`Community ${community.name} already exists`);
    }
  }

  // Add sample users
  const users = [
    {
      id: 'user-abc123',
      email: 'alice@example.com',
      is_human: true,
      created_at: new Date()
    },
    {
      id: 'user-def456',
      email: 'bob@example.com',
      is_human: true,
      created_at: new Date()
    }
  ];

  for (const user of users) {
    try {
      await prisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user
      });
      console.log(`User ${user.email} created/updated`);
    } catch (error) {
      console.log(`User ${user.email} already exists`);
    }
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase, seedDatabase }; 