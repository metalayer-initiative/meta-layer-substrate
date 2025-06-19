const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const api = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  // Auth endpoints
  auth: {
    login: (email) => api.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
    
    getSession: () => api.request('/auth/me'),
    
    checkPoH: (userId) => api.request('/auth/check', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),
  },

  // Community endpoints
  communities: {
    getAll: () => api.request('/communities'),
    
    select: (userId, communityId) => api.request('/communities/select', {
      method: 'POST',
      body: JSON.stringify({ userId, communityId }),
    }),
    
    getSelected: (userId) => api.request(`/communities/${userId}/selected`),
  },

  // Chat endpoints
  chat: {
    sendMessage: (userId, communityId, content) => api.request('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ userId, communityId, content }),
    }),
    
    getHistory: (communityId) => api.request(`/chat/history?communityId=${communityId}`),
  },

  // Avatar endpoints
  avatars: {
    getActive: (communityId) => api.request(`/avatars/active?communityId=${communityId}`),
  },

  // Interaction endpoints
  interactions: {
    log: (userId, action, result, blockTx) => api.request('/interaction/log', {
      method: 'POST',
      body: JSON.stringify({ userId, action, result, block_tx: blockTx }),
    }),
  },

  // Policy endpoints
  policy: {
    enforce: (userId, communityId, actionType, payload) => api.request('/policy/enforce', {
      method: 'POST',
      body: JSON.stringify({ userId, communityId, actionType, payload }),
    }),
  },
}; 