// Swarm Agent for orchestration
class SwarmAgent {
  constructor() {
    this.agents = new Map();
    this.tasks = new Map();
    this.isRunning = false;
  }

  // Register a new agent
  registerAgent(agentId, agentConfig) {
    this.agents.set(agentId, {
      id: agentId,
      config: agentConfig,
      status: 'idle',
      lastSeen: Date.now(),
      capabilities: agentConfig.capabilities || [],
    });
    console.log(`Agent ${agentId} registered`);
  }

  // Unregister an agent
  unregisterAgent(agentId) {
    this.agents.delete(agentId);
    console.log(`Agent ${agentId} unregistered`);
  }

  // Submit a task for execution
  submitTask(taskId, taskConfig) {
    const task = {
      id: taskId,
      config: taskConfig,
      status: 'pending',
      createdAt: Date.now(),
      assignedAgent: null,
    };
    
    this.tasks.set(taskId, task);
    this.assignTask(taskId);
    return task;
  }

  // Assign a task to an available agent
  assignTask(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) return;

    const availableAgent = this.findAvailableAgent(task.config.requirements);
    if (availableAgent) {
      task.assignedAgent = availableAgent.id;
      task.status = 'assigned';
      availableAgent.status = 'busy';
      console.log(`Task ${taskId} assigned to agent ${availableAgent.id}`);
    } else {
      console.log(`No available agent for task ${taskId}`);
    }
  }

  // Find an available agent with required capabilities
  findAvailableAgent(requirements = []) {
    for (const [agentId, agent] of this.agents) {
      if (agent.status === 'idle' && this.hasCapabilities(agent, requirements)) {
        return agent;
      }
    }
    return null;
  }

  // Check if agent has required capabilities
  hasCapabilities(agent, requirements) {
    return requirements.every(req => agent.capabilities.includes(req));
  }

  // Complete a task
  completeTask(taskId, result) {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = 'completed';
    task.result = result;
    task.completedAt = Date.now();

    // Free up the agent
    if (task.assignedAgent) {
      const agent = this.agents.get(task.assignedAgent);
      if (agent) {
        agent.status = 'idle';
      }
    }

    console.log(`Task ${taskId} completed`);
  }

  // Get swarm status
  getStatus() {
    return {
      agents: Array.from(this.agents.values()),
      tasks: Array.from(this.tasks.values()),
      isRunning: this.isRunning,
    };
  }

  // Start the swarm
  start() {
    this.isRunning = true;
    console.log('Swarm agent started');
  }

  // Stop the swarm
  stop() {
    this.isRunning = false;
    console.log('Swarm agent stopped');
  }
}

module.exports = SwarmAgent; 