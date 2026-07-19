import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [expiredMsg, setExpiredMsg] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If user is already logged in, redirect them
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    if (token && userString) {
      try {
        const user = JSON.parse(userString);
        redirectUser(user.role);
      } catch(e) {}
    }

    // Check if redirect was due to expired token
    if (location.search.includes('expired=true')) {
      setExpiredMsg(true);
    }
  }, [location]);

  const redirectUser = (role) => {
    if (role === 'ADMIN') navigate('/admin');
    else if (role === 'MANAGER') navigate('/manager');
    else navigate('/employee');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setExpiredMsg(false);

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      redirectUser(user.role);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Connection failed. Please check if backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 px-3">
      <div className="glass-panel p-4 p-md-5 w-100" style={{ maxWidth: '460px' }}>
        {/* Brand header */}
        <div className="text-center mb-4">
          <div 
            className="d-inline-flex align-items-center justify-content-center bg-primary rounded-4 mb-3" 
            style={{ width: '56px', height: '56px', background: 'var(--primary-gradient)' }}
          >
            <span className="fw-bold text-white fs-3">S</span>
          </div>
          <h2 className="fw-bold text-white mb-1">SmartAsset<span className="text-primary" style={{ color: '#6366f1' }}>X</span></h2>
          <p className="text-muted small">Office Asset Management Portal</p>
        </div>

        {expiredMsg && (
          <div className="alert alert-warning border-0 bg-warning-subtle text-warning d-flex align-items-center gap-2 rounded-3 mb-4 py-2" style={{ fontSize: '0.85rem' }}>
            <AlertCircle size={18} />
            <span>Session expired. Please login again.</span>
          </div>
        )}

        {error && (
          <div className="alert alert-danger border-0 bg-danger-subtle text-danger d-flex align-items-center gap-2 rounded-3 mb-4 py-2" style={{ fontSize: '0.85rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          {/* Email Input */}
          <div className="mb-3">
            <label className="form-label text-white-50 small">Email Address</label>
            <div className="position-relative">
              <Mail className="position-absolute text-muted" style={{ left: '16px', top: '50%', transform: 'translateY(-50%)' }} size={18} />
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control glass-input w-100"
                style={{ paddingLeft: '48px' }}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <div className="d-flex justify-content-between mb-1">
              <label className="form-label text-white-50 small">Password</label>
            </div>
            <div className="position-relative">
              <Lock className="position-absolute text-muted" style={{ left: '16px', top: '50%', transform: 'translateY(-50%)' }} size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control glass-input w-100"
                style={{ paddingLeft: '48px', paddingRight: '48px' }}
                required
              />
              <button
                type="button"
                className="btn btn-link position-absolute text-muted p-0 border-0 bg-transparent"
                style={{ right: '16px', top: '50%', transform: 'translateY(-50%)' }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-premium w-100 py-3 mb-3 d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>


      </div>
    </div>
  );
};

export default Login;
