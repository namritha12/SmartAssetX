import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { Check, X, FileText, Calendar, User, Tag, AlertCircle } from 'lucide-react';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/requests/pending');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load pending requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this asset request? If an asset is available, it will be automatically assigned.')) return;
    try {
      await api.put(`/requests/${id}/approve`);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed.');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this asset request?')) return;
    try {
      await api.put(`/requests/${id}/reject`);
      fetchRequests();
    } catch (err) {
      alert('Rejection failed.');
    }
  };

  return (
    <Layout>
      <div className="container-fluid">
        <h3 className="text-white fw-bold mb-4">Pending Asset Requests</h3>

        {errorMsg && (
          <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger d-flex align-items-center gap-2 rounded-3 py-2 small mb-4">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Requests Queue */}
        <div className="glass-panel p-0 overflow-x-auto">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <table className="table glass-table mb-0 w-100">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Email</th>
                  <th>Category Requested</th>
                  <th>Reason</th>
                  <th>Request Date</th>
                  <th style={{ width: '180px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">No pending requests in your department.</td>
                  </tr>
                ) : (
                  requests.map(req => (
                    <tr key={req.id}>
                      <td className="fw-semibold text-white d-flex align-items-center gap-2">
                        <User size={16} className="text-primary" /> {req.employeeName}
                      </td>
                      <td>{req.employeeEmail}</td>
                      <td>
                        <span className="badge bg-primary text-white d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
                          <Tag size={12} /> {req.categoryName}
                        </span>
                      </td>
                      <td className="text-truncate" style={{ maxWidth: '240px' }} title={req.reason}>
                        {req.reason}
                      </td>
                      <td>
                        <small className="text-muted d-flex align-items-center gap-1">
                          <Calendar size={14} /> {new Date(req.requestDate).toLocaleDateString()}
                        </small>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button 
                            onClick={() => handleApprove(req.id)} 
                            className="btn btn-sm btn-outline-success border-0 bg-success bg-opacity-10 text-success-hover d-flex align-items-center gap-1"
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button 
                            onClick={() => handleReject(req.id)} 
                            className="btn btn-sm btn-outline-danger border-0 bg-danger bg-opacity-10 text-danger-hover d-flex align-items-center gap-1"
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Requests;
