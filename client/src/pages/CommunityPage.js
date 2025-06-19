import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CommunityPage.css';

const CommunityPage = () => {
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      const response = await fetch('http://localhost:3001/communities');
      if (response.ok) {
        const data = await response.json();
        setCommunities(data.communities);
      }
    } catch (error) {
      console.error('Failed to fetch communities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommunitySelect = async (community) => {
    try {
      const session = JSON.parse(localStorage.getItem('session'));
      if (!session) {
        navigate('/auth');
        return;
      }

      const response = await fetch('http://localhost:3001/communities/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.userId,
          communityId: community.id,
        }),
      });

      if (response.ok) {
        setSelectedCommunity(community);
        navigate('/chat');
      }
    } catch (error) {
      console.error('Failed to select community:', error);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading communities...</div>;
  }

  return (
    <div className="community-page">
      <div className="community-container">
        <h2>Choose Your Community</h2>
        <p>Select a community to join the conversation</p>
        
        <div className="communities-grid">
          {communities.map((community) => (
            <div key={community.id} className="community-card">
              <h3>{community.name}</h3>
              <div className="community-rules">
                <p><strong>Anonymous:</strong> {community.ruleset.allowAnonymous ? 'Yes' : 'No'}</p>
                <p><strong>Moderation:</strong> {community.ruleset.moderation}</p>
              </div>
              <button
                onClick={() => handleCommunitySelect(community)}
                className="btn btn-primary"
              >
                Join Community
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityPage; 