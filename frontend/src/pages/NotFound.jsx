import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 px-3 text-center">
      <div className="glass-panel p-5" style={{ maxWidth: '500px' }}>
        <h1 className="display-1 fw-bold mb-3 text-gradient" style={{ fontSize: '7rem' }}>404</h1>
        <h3 className="text-white fw-semibold mb-3">Page Not Found</h3>
        <p className="text-muted mb-4">The page you are looking for does not exist or has been relocated.</p>
        <Link to="/login" className="btn btn-premium px-4 py-2 text-decoration-none">Back to Login</Link>
      </div>
    </div>
  );
};

export default NotFound;
