import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { NavLink } from 'react-router-dom';
import { 
  Laptop, 
  GitPullRequest, 
  History, 
  PlusCircle, 
  RotateCcw,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const EmployeeDashboard = () => {
  const [stats, setStats] = useState(null);
  const [myAssets, setMyAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployeeDashboard();
  }, []);

  const fetchEmployeeDashboard = async () => {
    try {
      setLoading(true);
      const [statsRes, assetsRes] = await Promise.all([
        api.get('/reports/dashboard'),
        api.get('/assignments/my')
      ]);
      setStats(statsRes.data);
      setMyAssets(assetsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnAsset = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to request a return for this asset?')) return;
    try {
      await api.post(`/assignments/return/${assignmentId}?remarks=Returned by employee`);
      fetchEmployeeDashboard();
    } catch (err) {
      alert('Return process failed.');
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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="text-white fw-bold mb-0">Employee Dashboard</h3>
          <NavLink to="/employee/request-asset" className="btn btn-premium d-flex align-items-center gap-2 text-decoration-none">
            <PlusCircle size={18} /> Request Asset
          </NavLink>
        </div>

        {/* Dashboard Metrics */}
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="glass-panel p-4 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted d-block small mb-1">Assigned</span>
                <h2 className="text-white mb-0 fw-bold">{stats.assignedAssets}</h2>
              </div>
              <div className="p-3 bg-primary bg-opacity-10 rounded-4 text-primary" style={{ color: '#8b5cf6' }}>
                <Laptop size={24} />
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="glass-panel p-4 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted d-block small mb-1">Requests</span>
                <h2 className="text-white mb-0 fw-bold">{stats.activeRequests}</h2>
              </div>
              <div className="p-3 bg-warning bg-opacity-10 rounded-4 text-warning">
                <GitPullRequest size={24} />
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="glass-panel p-4 d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted d-block small mb-1">Returned</span>
                <h2 className="text-white mb-0 fw-bold">{stats.returnedAssets}</h2>
              </div>
              <div className="p-3 bg-success bg-opacity-10 rounded-4 text-success">
                <History size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Active Assignments Listing */}
        <div className="glass-panel p-4">
          <h5 className="text-white mb-4 fw-bold">My Currently Assigned Equipment</h5>
          <div className="overflow-x-auto">
            <table className="table glass-table mb-0 w-100" style={{ fontSize: '0.95rem' }}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Asset Name</th>
                  <th>Assigned Date</th>
                  <th>Expected Return</th>
                  <th>Remarks</th>
                  <th style={{ width: '130px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myAssets.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">You do not have any active assets assigned.</td>
                  </tr>
                ) : (
                  myAssets.map(item => (
                    <tr key={item.id}>
                      <td className="text-white fw-semibold">{item.assetCode}</td>
                      <td>{item.assetName}</td>
                      <td>{new Date(item.assignedDate).toLocaleDateString()}</td>
                      <td>{item.expectedReturnDate ? new Date(item.expectedReturnDate).toLocaleDateString() : 'N/A'}</td>
                      <td>{item.remarks || 'None'}</td>
                      <td>
                        <button 
                          onClick={() => handleReturnAsset(item.id)} 
                          className="btn btn-sm btn-outline-danger border-0 bg-danger bg-opacity-10 text-danger-hover d-flex align-items-center gap-1"
                        >
                          <RotateCcw size={14} /> Return
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;
