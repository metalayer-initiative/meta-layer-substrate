import React, { useState, useEffect } from 'react';
import './UserList.css';

const UserList = ({ communityId }) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (communityId) {
      fetchActiveUsers();
    }
  }, [communityId]);

  const fetchActiveUsers = async () => {
    try {
      const response = await fetch(`http://localhost:3001/avatars/active?communityId=${communityId}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.active);
      }
    } catch (error) {
      console.error('Failed to fetch active users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="user-list-loading">Loading users...</div>;
  }

  return (
    <div className="user-list">
      <h3>Active Users</h3>
      <div className="users-container">
        {users.length === 0 ? (
          <p className="no-users">No active users</p>
        ) : (
          users.map((user) => (
            <div key={user.userId} className="user-item">
              <div className="user-avatar">
                {user.userId.slice(-2).toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-name">User {user.userId.slice(-4)}</span>
                <span className="user-status">Active</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserList; 