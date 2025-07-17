import React, { useEffect, useState } from 'react';

type Interaction = {
  id: string;
  user_id: string;
  action_type: string;
  policy_applied: string;
  block_tx_hash: string;
  timestamp: string;
};

export default function InteractionFeed() {
  const [interactions, setInteractions] = useState<Interaction[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/interactions')
      .then((res) => res.json())
      .then(setInteractions)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h2>Interaction Feed</h2>
      <ul>
        {interactions.map((i) => (
          <li key={i.id} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
            <div><strong>Time:</strong> {new Date(i.timestamp).toLocaleString()}</div>
            <div><strong>User:</strong> {i.user_id}</div>
            <div><strong>Action:</strong> {i.action_type}</div>
            <div><strong>Policy:</strong> <span style={{ color: i.policy_applied === 'allow' ? 'green' : 'red' }}>{i.policy_applied}</span></div>
            <div><strong>Hash:</strong> <code>{i.block_tx_hash}</code></div>
          </li>
        ))}
      </ul>
    </div>
  );
}
