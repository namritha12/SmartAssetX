import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { Calendar, Tag, UserCheck, AlertCircle } from 'lucide-react';

const RequestHistory = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/requests/my');
      setRequests(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load request history.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container-fluid">
        <h3 className="text-white fw-bold mb-4">My Request History</h3>

        {errorMsg && (
          <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger d-flex align-items-center gap-2 rounded-3 py-2 small mb-4">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Requests Table */}
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
                  <th>Category</th>
                  <th>Reason</th>
                  <th>Date Requested</th>
                  <th>Status</th>
                  <th>Approved/Rejected By</th>
                  <th>Action Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">You have not submitted any asset requests.</td>
                  </tr>
                ) : (
                  requests.map(req => (
                    <tr key={req.id}>
                      <td>
                        <span className="badge bg-primary text-white d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
                          <Tag size={12} /> {req.categoryName}
                        </span>
                      </td>
                      <td className="text-truncate" style={{ maxWidth: '250px' }} title={req.reason}>
                        {req.reason}
                      </td>
                      <td>
                        <small className="text-muted d-flex align-items-center gap-1">
                          <Calendar size={14} /> {new Date(req.requestDate).toLocaleDateString()}
                        </small>
                      </td>
                      <td>
                        <span className={`badge ${
                          req.status === 'Approved' ? 'bg-success' :
                          req.status === 'Rejected' ? 'bg-danger' :
                          'bg-warning'
                        } text-white`}>{req.status}</span>
                      </td>
                      <td>
                        {req.approvedByName ? (
                          <span className="d-flex align-items-center gap-1">
                            <UserCheck size={14} className="text-success" /> {req.approvedByName}
                          </span>
                        ) : (
                          <span className="text-muted small">Awaiting Review</span>
                        )}
                      </td>
                      <td>
                        {req.approvedDate ? (
                          <small className="text-muted">
                            {new Date(req.approvedDate).toLocaleDateString()}
                          </small>
                        ) : (
                          '--'
                        )}
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

export default RequestHistory;
