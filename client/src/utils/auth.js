export const authUtils = {
  // Get session from localStorage
  getSession() {
    try {
      const session = localStorage.getItem('session');
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error('Failed to parse session:', error);
      this.clearSession();
      return null;
    }
  },

  // Set session in localStorage
  setSession(session) {
    try {
      localStorage.setItem('session', JSON.stringify(session));
      return true;
    } catch (error) {
      console.error('Failed to save session:', error);
      return false;
    }
  },

  // Clear session from localStorage
  clearSession() {
    localStorage.removeItem('session');
  },

  // Check if user is authenticated
  isAuthenticated() {
    const session = this.getSession();
    return !!session && !!session.userId;
  },

  // Get user ID from session
  getUserId() {
    const session = this.getSession();
    return session?.userId;
  },

  // Get user email from session
  getUserEmail() {
    const session = this.getSession();
    return session?.email;
  },

  // Check if user is human verified
  isHumanVerified() {
    const session = this.getSession();
    return session?.is_human === true;
  },

  // Format user display name
  getUserDisplayName(userId) {
    if (!userId) return 'Unknown User';
    return `User ${userId.slice(-4)}`;
  },

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
}; 