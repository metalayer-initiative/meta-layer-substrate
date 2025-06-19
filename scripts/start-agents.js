#!/usr/bin/env node

const SwarmAgent = require('../server/agents/swarmAgent');
const ElizaAgent = require('../server/agents/elizaAgent');

// Initialize agents
const swarm = new SwarmAgent();
const eliza = new ElizaAgent();

// Start the swarm
swarm.start();

// Initialize Eliza agent
eliza.initialize();

// Register Eliza agent with swarm
swarm.registerAgent(eliza.agentId, {
  capabilities: eliza.capabilities,
  type: 'nlp',
  version: '2.0'
});

console.log('Agent system started');
console.log('Swarm status:', swarm.getStatus());
console.log('Eliza status:', eliza.getStatus());

// Example task submission
setTimeout(() => {
  const taskId = `task-${Date.now()}`;
  const task = swarm.submitTask(taskId, {
    type: 'process_message',
    requirements: ['nlp', 'conversation'],
    data: {
      message: 'Hello, I need help with my community',
      userId: 'user-123'
    }
  });
  
  console.log('Submitted task:', task);
}, 2000);

// Keep the process running
process.on('SIGINT', () => {
  console.log('\nShutting down agent system...');
  swarm.stop();
  process.exit(0);
}); 