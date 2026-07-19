import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 px-3 text-center">
      <div className="glass-panel p-5" style={{ maxWidth: '500px' }}>
        <h1 className="display-1 fw-bold text-danger mb-3" style={{ fontSize: '7rem' }}>403</h1>
        <h3 className="text-white fw-semibold mb-3">Access Denied</h3>
        <p className="text-muted mb-4">You do not have the necessary permissions to access this page.</p>
        <button onClick={() => navigate(-1)} className="btn btn-premium px-4 py-2 border-0">Go Back</button>
      </div>
    </div>
  );
};

export default Unauthorized;
