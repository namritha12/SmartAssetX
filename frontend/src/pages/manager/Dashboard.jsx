import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { NavLink } from 'react-router-dom';
import { 
  GitPullRequest, 
  Laptop, 
  Users, 
  Wrench, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';

const ManagerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchManagerStats();
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const fetchManagerStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
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
        <div className="mb-4">
          <h3 className="text-white fw-bold">Manager Dashboard</h3>
          <p className="text-muted mb-0">Managing Department: <span className="text-white fw-medium">{user?.departmentName || 'N/A'}</span></p>
        </div>

        {/* Dashboard Cards */}
        <div className="row g-4 mb-4">
          <div className="col-xl-4 col-md-6">
            <div className="glass-panel p-4 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted d-block small mb-1">Pending</span>
                <h2 className="text-white mb-0 fw-bold">{stats.pendingRequests}</h2>
              </div>
              <div className="p-3 bg-warning bg-opacity-10 rounded-4 text-warning">
                <GitPullRequest size={24} />
              </div>
            </div>
          </div>

          <div className="col-xl-4 col-md-6">
            <div className="glass-panel p-4 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted d-block small mb-1">Inventory</span>
                <h2 className="text-white mb-0 fw-bold">{stats.departmentAssets}</h2>
              </div>
              <div className="p-3 bg-indigo bg-opacity-10 rounded-4 text-indigo" style={{ color: '#8b5cf6' }}>
                <Laptop size={24} />
              </div>
            </div>
          </div>

          <div className="col-xl-4 col-md-6">
            <div className="glass-panel p-4 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted d-block small mb-1">Assigned</span>
                <h2 className="text-white mb-0 fw-bold">{stats.assignedAssets}</h2>
              </div>
              <div className="p-3 bg-success bg-opacity-10 rounded-4 text-success">
                <Users size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Maintenance */}
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="glass-panel p-4 d-flex flex-column justify-content-between h-100">
              <div>
                <h5 className="text-white fw-bold mb-2">Pending Requests</h5>
                <p className="text-muted small">You have {stats.pendingRequests} asset approval requests waiting from employees in your department.</p>
              </div>
              <NavLink to="/manager/requests" className="btn btn-premium w-100 mt-3 d-flex align-items-center justify-content-center gap-2 text-decoration-none">
                Go to Requests <ArrowRight size={16} />
              </NavLink>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="glass-panel p-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <h5 className="text-white fw-bold mb-2">Department Assets</h5>
                <p className="text-muted small">View all equipment assets currently mapped to employees under your leadership.</p>
              </div>
              <NavLink to="/manager/department-assets" className="btn btn-premium w-100 mt-3 d-flex align-items-center justify-content-center gap-2 text-decoration-none">
                View Department Assets <ArrowRight size={16} />
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManagerDashboard;
