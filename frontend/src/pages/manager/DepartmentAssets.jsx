import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { Laptop, Tag, AlertCircle } from 'lucide-react';

const DepartmentAssets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      if (parsedUser.departmentId) {
        fetchDeptAssets(parsedUser.departmentId);
      }
    }
  }, []);

  const fetchDeptAssets = async (deptId) => {
    try {
      setLoading(true);
      const res = await api.get(`/assets/filter?departmentId=${deptId}`);
      setAssets(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load department inventory.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container-fluid">
        <div className="mb-4">
          <h3 className="text-white fw-bold mb-0">Department Inventory</h3>
          <p className="text-muted">Viewing all equipment assigned to: <span className="text-white fw-medium">{user?.departmentName || 'N/A'}</span></p>
        </div>

        {errorMsg && (
          <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger d-flex align-items-center gap-2 rounded-3 py-2 small mb-4">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Assets List */}
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
                  <th>Code</th>
                  <th>Asset Name</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Brand</th>
                  <th>Model</th>
                  <th>Serial Number</th>
                </tr>
              </thead>
              <tbody>
                {assets.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">No assets assigned to your department.</td>
                  </tr>
                ) : (
                  assets.map(asset => (
                    <tr key={asset.id}>
                      <td className="fw-semibold text-white d-flex align-items-center gap-2">
                        <Laptop size={16} className="text-primary" /> {asset.assetCode}
                      </td>
                      <td>{asset.assetName}</td>
                      <td>
                        <span className="badge bg-primary text-white d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
                          <Tag size={12} /> {asset.categoryName}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          asset.status === 'Available' ? 'bg-success' :
                          asset.status === 'Assigned' ? 'bg-primary' :
                          'bg-warning'
                        } text-white`}>{asset.status}</span>
                      </td>
                      <td>{asset.brand || 'N/A'}</td>
                      <td>{asset.model || 'N/A'}</td>
                      <td>{asset.serialNumber || 'N/A'}</td>
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

export default DepartmentAssets;
