// ElizaOS v2 Agent for natural language processing
class ElizaAgent {
  constructor() {
    this.patterns = new Map();
    this.context = new Map();
    this.conversationHistory = [];
    this.agentId = `eliza-${Date.now()}`;
    this.capabilities = ['nlp', 'conversation', 'sentiment_analysis'];
  }

  // Initialize the agent with patterns
  initialize() {
    this.loadPatterns();
    console.log(`ElizaAgent ${this.agentId} initialized`);
  }

  // Load conversation patterns
  loadPatterns() {
    this.patterns.set('greeting', {
      patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon'],
      responses: [
        'Hello! How are you feeling today?',
        'Hi there! What\'s on your mind?',
        'Greetings! How can I help you?'
      ]
    });

    this.patterns.set('feeling', {
      patterns: ['i feel', 'i am feeling', 'i\'m feeling', 'i feel like'],
      responses: [
        'I understand you feel that way. Can you tell me more about it?',
        'That sounds like an important feeling. What do you think caused it?',
        'I hear you. How long have you been feeling this way?'
      ]
    });

    this.patterns.set('problem', {
      patterns: ['problem', 'issue', 'trouble', 'difficulty', 'challenge'],
      responses: [
        'I see you\'re facing a challenge. What have you tried so far?',
        'That sounds difficult. What would be most helpful right now?',
        'I\'m here to listen. Can you describe the situation in more detail?'
      ]
    });

    this.patterns.set('community', {
      patterns: ['community', 'group', 'people', 'others', 'members'],
      responses: [
        'Communities can be wonderful sources of support. What kind of community are you looking for?',
        'Connecting with others is important. What interests or values do you share with potential community members?',
        'Being part of a community can provide great benefits. What would you like to contribute to a community?'
      ]
    });
  }

  // Process incoming message
  async processMessage(message, userId, context = {}) {
    const timestamp = Date.now();
    
    // Store in conversation history
    this.conversationHistory.push({
      userId,
      message,
      timestamp,
      context
    });

    // Analyze sentiment
    const sentiment = this.analyzeSentiment(message);
    
    // Find matching pattern
    const response = this.generateResponse(message, sentiment);
    
    // Update context
    this.updateContext(userId, { message, sentiment, response });

    return {
      agentId: this.agentId,
      response,
      sentiment,
      timestamp,
      confidence: this.calculateConfidence(message)
    };
  }

  // Analyze sentiment of message
  analyzeSentiment(message) {
    const positiveWords = ['good', 'great', 'excellent', 'happy', 'joy', 'love', 'wonderful', 'amazing'];
    const negativeWords = ['bad', 'terrible', 'awful', 'sad', 'angry', 'hate', 'horrible', 'worried'];
    
    const words = message.toLowerCase().split(/\s+/);
    let score = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });
    
    if (score > 0) return 'positive';
    if (score < 0) return 'negative';
    return 'neutral';
  }

  // Generate response based on message and sentiment
  generateResponse(message, sentiment) {
    const lowerMessage = message.toLowerCase();
    
    // Find matching pattern
    for (const [patternType, patternData] of this.patterns) {
      for (const pattern of patternData.patterns) {
        if (lowerMessage.includes(pattern)) {
          const responses = patternData.responses;
          return responses[Math.floor(Math.random() * responses.length)];
        }
      }
    }
    
    // Default responses based on sentiment
    const defaultResponses = {
      positive: [
        'That sounds wonderful! I\'m glad to hear that.',
        'That\'s great! What made you feel this way?',
        'I\'m happy for you! Tell me more about it.'
      ],
      negative: [
        'I\'m sorry you\'re feeling this way. Would you like to talk about it?',
        'That sounds difficult. I\'m here to listen if you want to share more.',
        'I understand this is challenging. What would be most helpful right now?'
      ],
      neutral: [
        'I see. Can you tell me more about that?',
        'That\'s interesting. What are your thoughts on this?',
        'I\'d like to understand better. Could you elaborate?'
      ]
    };
    
    const responses = defaultResponses[sentiment];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Calculate confidence in response
  calculateConfidence(message) {
    const lowerMessage = message.toLowerCase();
    let maxConfidence = 0;
    
    for (const [patternType, patternData] of this.patterns) {
      for (const pattern of patternData.patterns) {
        if (lowerMessage.includes(pattern)) {
          const confidence = pattern.length / message.length;
          maxConfidence = Math.max(maxConfidence, confidence);
        }
      }
    }
    
    return Math.min(maxConfidence, 1.0);
  }

  // Update user context
  updateContext(userId, data) {
    if (!this.context.has(userId)) {
      this.context.set(userId, {});
    }
    
    const userContext = this.context.get(userId);
    Object.assign(userContext, data);
  }

  // Get user context
  getUserContext(userId) {
    return this.context.get(userId) || {};
  }

  // Get conversation history
  getConversationHistory(userId, limit = 10) {
    return this.conversationHistory
      .filter(entry => entry.userId === userId)
      .slice(-limit);
  }

  // Get agent status
  getStatus() {
    return {
      agentId: this.agentId,
      capabilities: this.capabilities,
      activeContexts: this.context.size,
      conversationHistoryLength: this.conversationHistory.length,
      patternsLoaded: this.patterns.size
    };
  }
}

module.exports = ElizaAgent; 