import { useState, useEffect, useCallback } from 'react';

export const useChat = (communityId) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMessages = useCallback(async () => {
    if (!communityId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:3001/chat/history?communityId=${communityId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      } else {
        setError('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  }, [communityId]);

  const sendMessage = async (content, userId) => {
    if (!content.trim() || !userId || !communityId) return;

    try {
      const response = await fetch('http://localhost:3001/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          communityId,
          content,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.msg]);
        return { success: true, message: data.msg };
      } else {
        setError('Failed to send message');
        return { success: false, error: 'Failed to send message' };
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Network error');
      return { success: false, error: 'Network error' };
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    refetch: fetchMessages,
  };
}; 