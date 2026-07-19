import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Layout from '../components/Layout';
import { User, Phone, Mail, Award, Key, Shield, CheckCircle, AlertCircle } from 'lucide-react';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      setProfile(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/profile/password', { oldPassword, newPassword });
      setPassSuccess('Password updated successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setPassError(err.response.data.message);
      } else {
        setPassError('Failed to change password. Please verify current password.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <Layout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-fluid">
        <h3 className="text-white mb-4 fw-bold">My Profile</h3>
        <div className="row g-4">
          {/* User Details */}
          <div className="col-lg-6">
            <div className="glass-panel p-4 h-100">
              <h5 className="text-white mb-4 fw-bold d-flex align-items-center gap-2">
                <User className="text-primary" /> Profile Info
              </h5>
              
              <div className="d-flex flex-column gap-3">
                <div className="d-flex justify-content-between border-bottom border-secondary border-opacity-10 pb-2">
                  <span className="text-white-50 small">Full Name</span>
                  <span className="text-white fw-medium">{profile.fullName}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom border-secondary border-opacity-10 pb-2">
                  <span className="text-white-50 small">Employee ID</span>
                  <span className="text-white fw-medium">{profile.employeeId}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom border-secondary border-opacity-10 pb-2">
                  <span className="text-white-50 small">Email Address</span>
                  <span className="text-white fw-medium text-truncate ms-2" style={{ maxWidth: '250px' }}>{profile.email}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom border-secondary border-opacity-10 pb-2">
                  <span className="text-white-50 small">Phone Number</span>
                  <span className="text-white fw-medium">{profile.phone || 'N/A'}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom border-secondary border-opacity-10 pb-2">
                  <span className="text-white-50 small">Designation</span>
                  <span className="text-white fw-medium">{profile.designation || 'N/A'}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom border-secondary border-opacity-10 pb-2">
                  <span className="text-white-50 small">Department</span>
                  <span className="text-white fw-medium">{profile.departmentName || 'N/A'}</span>
                </div>
                <div className="d-flex justify-content-between border-bottom border-secondary border-opacity-10 pb-2 align-items-center">
                  <span className="text-white-50 small">System Role</span>
                  <span className="badge bg-primary text-white d-flex align-items-center gap-1" style={{ width: 'fit-content', background: 'var(--primary-gradient) !important' }}>
                    <Shield size={14} /> {profile.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Password Change Form */}
          <div className="col-lg-6">
            <div className="glass-panel p-4 h-100">
              <h5 className="text-white mb-4 fw-bold d-flex align-items-center gap-2">
                <Key className="text-primary" /> Change Password
              </h5>

              {passError && (
                <div className="alert alert-danger border-0 bg-danger-subtle text-danger d-flex align-items-center gap-2 rounded-3 py-2 small">
                  <AlertCircle size={16} />
                  <span>{passError}</span>
                </div>
              )}

              {passSuccess && (
                <div className="alert alert-success border-0 bg-success-subtle text-success d-flex align-items-center gap-2 rounded-3 py-2 small">
                  <CheckCircle size={16} />
                  <span>{passSuccess}</span>
                </div>
              )}

              <form onSubmit={handlePasswordChange}>
                <div className="mb-3">
                  <label className="form-label text-white-50 small">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="form-control glass-input w-100"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-white-50 small">New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-control glass-input w-100"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label text-white-50 small">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="form-control glass-input w-100"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-premium w-100 py-2" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
