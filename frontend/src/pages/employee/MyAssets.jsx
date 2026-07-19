import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { Laptop, RotateCcw, Calendar, Check, ShieldCheck } from 'lucide-react';

const MyAssets = () => {
  const [activeAssets, setActiveAssets] = useState([]);
  const [historyAssets, setHistoryAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // active or history

  useEffect(() => {
    loadMyAssets();
  }, []);

  const loadMyAssets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/assignments/my');
      
      // Load total history to filter out active vs returned
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        const historyRes = await api.get(`/assignments/employee/${user.id}`);
        
        setActiveAssets(res.data);
        setHistoryAssets(historyRes.data.filter(a => a.actualReturnDate !== null));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnAsset = async (assignmentId) => {
    if (!window.confirm('Confirm returning this asset to the inventory?')) return;
    try {
      await api.post(`/assignments/return/${assignmentId}?remarks=Returned by employee`);
      loadMyAssets();
    } catch (err) {
      alert('Return request failed.');
    }
  };

  return (
    <Layout>
      <div className="container-fluid">
        <h3 className="text-white fw-bold mb-4">My Assets</h3>

        {/* Custom Tabs */}
        <div className="d-flex gap-2 mb-4">
          <button 
            onClick={() => setActiveTab('active')} 
            className={`btn ${activeTab === 'active' ? 'btn-premium' : 'btn-outline-light border-0 bg-secondary-subtle'}`}
          >
            Currently Assigned ({activeAssets.length})
          </button>
          <button 
            onClick={() => setActiveTab('history')} 
            className={`btn ${activeTab === 'history' ? 'btn-premium' : 'btn-outline-light border-0 bg-secondary-subtle'}`}
          >
            Return History ({historyAssets.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="glass-panel p-0 overflow-x-auto">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : activeTab === 'active' ? (
            <table className="table glass-table mb-0 w-100">
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
                {activeAssets.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">No active assets assigned.</td>
                  </tr>
                ) : (
                  activeAssets.map(item => (
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
          ) : (
            <table className="table glass-table mb-0 w-100">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Asset Name</th>
                  <th>Assigned Date</th>
                  <th>Actual Return Date</th>
                  <th>Remarks Log</th>
                </tr>
              </thead>
              <tbody>
                {historyAssets.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">No return logs recorded.</td>
                  </tr>
                ) : (
                  historyAssets.map(item => (
                    <tr key={item.id}>
                      <td className="text-white fw-semibold">{item.assetCode}</td>
                      <td>{item.assetName}</td>
                      <td>{new Date(item.assignedDate).toLocaleDateString()}</td>
                      <td className="text-success font-medium d-flex align-items-center gap-1">
                        <ShieldCheck size={16} /> {new Date(item.actualReturnDate).toLocaleDateString()}
                      </td>
                      <td>{item.remarks || 'None'}</td>
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

export default MyAssets;
