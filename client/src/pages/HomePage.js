import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Welcome to Metalayer Initiative</h1>
        <p>A decentralized social platform with human verification</p>
        <div className="cta-buttons">
          <Link to="/auth" className="btn btn-primary">
            Get Started
          </Link>
          <Link to="/community" className="btn btn-secondary">
            Explore Communities
          </Link>
        </div>
      </div>
      
      <div className="features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Proof of Humanity</h3>
            <p>Verified human users through Fractal ID integration</p>
          </div>
          <div className="feature-card">
            <h3>Community Governance</h3>
            <p>Flexible rulesets and moderation for different communities</p>
          </div>
          <div className="feature-card">
            <h3>Policy Enforcement</h3>
            <p>Automated policy enforcement with OPA integration</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 