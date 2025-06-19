import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedSession = localStorage.getItem('session');
    if (storedSession) {
      try {
        setSession(JSON.parse(storedSession));
      } catch (error) {
        console.error('Failed to parse session:', error);
        localStorage.removeItem('session');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email) => {
    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        const sessionData = data.session;
        setSession(sessionData);
        localStorage.setItem('session', JSON.stringify(sessionData));
        return { success: true, session: sessionData };
      } else {
        return { success: false, error: 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem('session');
  };

  const checkSession = async () => {
    if (!session) return false;
    
    try {
      const response = await fetch('http://localhost:3001/auth/me');
      if (response.ok) {
        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      console.error('Session check failed:', error);
      return false;
    }
  };

  return {
    session,
    isLoading,
    login,
    logout,
    checkSession,
    isAuthenticated: !!session,
  };
}; 