import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  UserPlus, 
  RefreshCw, 
  Filter, 
  Check, 
  X,
  AlertCircle
} from 'lucide-react';

const AssetManagement = () => {
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assignments, setAssignments] = useState([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modals / Action States
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningAsset, setAssigningAsset] = useState(null);
  
  // Form Fields
  const [assetForm, setAssetForm] = useState({
    assetCode: '',
    assetName: '',
    serialNumber: '',
    brand: '',
    model: '',
    purchaseDate: '',
    purchaseCost: '',
    warrantyExpiry: '',
    amcExpiry: '',
    status: 'Available',
    categoryId: '',
    departmentId: ''
  });

  const [assignForm, setAssignForm] = useState({
    employeeId: '',
    expectedReturnDate: '',
    remarks: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [assetsRes, catRes, deptRes, usersRes, assignRes] = await Promise.all([
        api.get('/assets'),
        api.get('/categories'),
        api.get('/departments'),
        api.get('/auth/users'),
        api.get('/assignments')
      ]);

      setAssets(assetsRes.data);
      setCategories(catRes.data);
      setDepartments(deptRes.data);
      setEmployees(usersRes.data.filter(u => u.role === 'EMPLOYEE' && u.status === 'ACTIVE'));
      setAssignments(assignRes.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load assets data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.get(`/assets/search?query=${searchQuery}`);
      setAssets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/assets/filter`, {
        params: {
          categoryId: filterCategory || null,
          departmentId: filterDepartment || null,
          status: filterStatus || null
        }
      });
      setAssets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddAsset = () => {
    setEditingAsset(null);
    setAssetForm({
      assetCode: '',
      assetName: '',
      serialNumber: '',
      brand: '',
      model: '',
      purchaseDate: '',
      purchaseCost: '',
      warrantyExpiry: '',
      amcExpiry: '',
      status: 'Available',
      categoryId: categories[0]?.id || '',
      departmentId: ''
    });
    setErrorMsg('');
    setShowAssetModal(true);
  };

  const openEditAsset = (asset) => {
    setEditingAsset(asset);
    setAssetForm({
      assetCode: asset.assetCode,
      assetName: asset.assetName,
      serialNumber: asset.serialNumber || '',
      brand: asset.brand || '',
      model: asset.model || '',
      purchaseDate: asset.purchaseDate || '',
      purchaseCost: asset.purchaseCost || '',
      warrantyExpiry: asset.warrantyExpiry || '',
      amcExpiry: asset.amcExpiry || '',
      status: asset.status,
      categoryId: asset.categoryId,
      departmentId: asset.departmentId || ''
    });
    setErrorMsg('');
    setShowAssetModal(true);
  };

  const handleSaveAsset = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const payload = {
        ...assetForm,
        categoryId: parseInt(assetForm.categoryId),
        departmentId: assetForm.departmentId ? parseInt(assetForm.departmentId) : null,
        purchaseCost: assetForm.purchaseCost ? parseFloat(assetForm.purchaseCost) : null,
        purchaseDate: assetForm.purchaseDate || null,
        warrantyExpiry: assetForm.warrantyExpiry || null,
        amcExpiry: assetForm.amcExpiry || null
      };

      if (editingAsset) {
        await api.put(`/assets/${editingAsset.id}`, payload);
      } else {
        await api.post('/assets', payload);
      }
      setShowAssetModal(false);
      loadInitialData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error occurred while saving asset.');
    }
  };

  const handleDeleteAsset = async (id) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    try {
      await api.delete(`/assets/${id}`);
      loadInitialData();
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot delete asset.');
    }
  };

  const openAssignAsset = (asset) => {
    setAssigningAsset(asset);
    setAssignForm({
      employeeId: employees[0]?.id || '',
      expectedReturnDate: '',
      remarks: ''
    });
    setErrorMsg('');
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const payload = {
        assetId: assigningAsset.id,
        employeeId: parseInt(assignForm.employeeId),
        expectedReturnDate: assignForm.expectedReturnDate ? `${assignForm.expectedReturnDate}T18:00:00` : null,
        remarks: assignForm.remarks
      };

      await api.post('/assignments/assign', payload);
      setShowAssignModal(false);
      loadInitialData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Assignment failed.');
    }
  };

  const handleReturnAsset = async (assetId) => {
    // Find active assignment for this asset
    const activeAssign = assignments.find(a => a.assetId === assetId && a.actualReturnDate === null);
    if (!activeAssign) return;

    if (!window.confirm(`Initiate return for asset: ${activeAssign.assetName}?`)) return;

    try {
      await api.post(`/assignments/return/${activeAssign.id}?remarks=Returned via admin panel`);
      loadInitialData();
    } catch (err) {
      alert('Return process failed.');
    }
  };

  return (
    <Layout>
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="text-white fw-bold mb-0">Asset Management</h3>
          <button onClick={openAddAsset} className="btn btn-premium d-flex align-items-center gap-2">
            <Plus size={18} /> Add New Asset
          </button>
        </div>

        {/* Search & Filter Panel */}
        <div className="glass-panel p-4 mb-4">
          <div className="row g-3 align-items-end">
            <div className="col-lg-4">
              <form onSubmit={handleSearch}>
                <label className="form-label text-white-50 small">Search Assets</label>
                <div className="position-relative">
                  <Search className="position-absolute text-muted" style={{ left: '16px', top: '50%', transform: 'translateY(-50%)' }} size={16} />
                  <input
                    type="text"
                    placeholder="Search by code, serial, name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-control glass-input w-100"
                    style={{ paddingLeft: '44px' }}
                  />
                </div>
              </form>
            </div>

            <div className="col-sm-6 col-lg-2">
              <label className="form-label text-white-50 small">Category</label>
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)} 
                className="form-select glass-input w-100"
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.categoryName}</option>
                ))}
              </select>
            </div>

            <div className="col-sm-6 col-lg-2">
              <label className="form-label text-white-50 small">Department</label>
              <select 
                value={filterDepartment} 
                onChange={(e) => setFilterDepartment(e.target.value)} 
                className="form-select glass-input w-100"
              >
                <option value="">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.departmentName}</option>
                ))}
              </select>
            </div>

            <div className="col-sm-6 col-lg-2">
              <label className="form-label text-white-50 small">Status</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)} 
                className="form-select glass-input w-100"
              >
                <option value="">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Assigned">Assigned</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Damaged">Damaged</option>
                <option value="Lost">Lost</option>
                <option value="Retired">Retired</option>
              </select>
            </div>

            <div className="col-sm-6 col-lg-2">
              <button onClick={handleFilter} className="btn btn-premium w-100 py-2 d-flex align-items-center justify-content-center gap-2">
                <Filter size={16} /> Filter
              </button>
            </div>
          </div>
        </div>

        {/* Table View */}
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
                  <th>Assigned Dept</th>
                  <th>Brand / Model</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">No assets found matching parameters.</td>
                  </tr>
                ) : (
                  assets.map(asset => (
                    <tr key={asset.id}>
                      <td className="fw-semibold text-white">{asset.assetCode}</td>
                      <td>{asset.assetName}</td>
                      <td>{asset.categoryName}</td>
                      <td>
                        <span className={`badge ${
                          asset.status === 'Available' ? 'bg-success' :
                          asset.status === 'Assigned' ? 'bg-primary' :
                          'bg-warning'
                        } text-white`}>{asset.status}</span>
                      </td>
                      <td>{asset.departmentName || 'N/A'}</td>
                      <td>{asset.brand} {asset.model}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button onClick={() => openEditAsset(asset)} className="btn btn-outline-light btn-sm rounded-3 border-0 bg-secondary-subtle" title="Edit">
                            <Edit2 size={14} />
                          </button>
                          
                          {asset.status === 'Available' && (
                            <button onClick={() => openAssignAsset(asset)} className="btn btn-outline-primary btn-sm rounded-3 border-0 bg-primary bg-opacity-10 text-primary-hover" title="Assign">
                              <UserPlus size={14} />
                            </button>
                          )}

                          {asset.status === 'Assigned' && (
                            <button onClick={() => handleReturnAsset(asset.id)} className="btn btn-outline-success btn-sm rounded-3 border-0 bg-success bg-opacity-10 text-success-hover" title="Return Asset">
                              <RefreshCw size={14} />
                            </button>
                          )}

                          <button onClick={() => handleDeleteAsset(asset.id)} className="btn btn-outline-danger btn-sm rounded-3 border-0 bg-danger bg-opacity-10 text-danger-hover" title="Delete">
                            <Trash2 size={14} />
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

        {/* Create / Edit Asset Modal */}
        {showAssetModal && (
          <div className="modal d-block spinner-overlay" style={{ background: 'rgba(15, 23, 42, 0.8)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content glass-panel border border-secondary border-opacity-25" style={{ background: 'rgba(30, 41, 59, 0.98)' }}>
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title text-white fw-bold">{editingAsset ? 'Edit Asset' : 'Add Asset'}</h5>
                  <button type="button" className="btn btn-link text-white p-0 border-0" onClick={() => setShowAssetModal(false)}>
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSaveAsset}>
                  <div className="modal-body p-4">
                    {errorMsg && (
                      <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger d-flex align-items-center gap-2 rounded-3 py-2 small mb-3">
                        <AlertCircle size={16} />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label text-white-50 small">Asset Code</label>
                        <input
                          type="text"
                          value={assetForm.assetCode}
                          onChange={(e) => setAssetForm({...assetForm, assetCode: e.target.value})}
                          className="form-control glass-input w-100"
                          placeholder="e.g. AST-LAP-101"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label text-white-50 small">Asset Name</label>
                        <input
                          type="text"
                          value={assetForm.assetName}
                          onChange={(e) => setAssetForm({...assetForm, assetName: e.target.value})}
                          className="form-control glass-input w-100"
                          placeholder="e.g. Dell Latitude 5420"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label text-white-50 small">Category</label>
                        <select
                          value={assetForm.categoryId}
                          onChange={(e) => setAssetForm({...assetForm, categoryId: e.target.value})}
                          className="form-select glass-input w-100"
                          required
                        >
                          {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.categoryName}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label text-white-50 small">Status</label>
                        <select
                          value={assetForm.status}
                          onChange={(e) => setAssetForm({...assetForm, status: e.target.value})}
                          className="form-select glass-input w-100"
                          required
                        >
                          <option value="Available">Available</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Damaged">Damaged</option>
                          <option value="Lost">Lost</option>
                          <option value="Retired">Retired</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label text-white-50 small">Department Owner</label>
                        <select
                          value={assetForm.departmentId}
                          onChange={(e) => setAssetForm({...assetForm, departmentId: e.target.value})}
                          className="form-select glass-input w-100"
                        >
                          <option value="">Unassigned (Central Store)</option>
                          {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.departmentName}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label text-white-50 small">Serial Number</label>
                        <input
                          type="text"
                          value={assetForm.serialNumber}
                          onChange={(e) => setAssetForm({...assetForm, serialNumber: e.target.value})}
                          className="form-control glass-input w-100"
                          placeholder="e.g. SN12345"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label text-white-50 small">Brand</label>
                        <input
                          type="text"
                          value={assetForm.brand}
                          onChange={(e) => setAssetForm({...assetForm, brand: e.target.value})}
                          className="form-control glass-input w-100"
                          placeholder="e.g. Dell"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label text-white-50 small">Model</label>
                        <input
                          type="text"
                          value={assetForm.model}
                          onChange={(e) => setAssetForm({...assetForm, model: e.target.value})}
                          className="form-control glass-input w-100"
                          placeholder="e.g. Latitude"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label text-white-50 small">Purchase Date</label>
                        <input
                          type="date"
                          value={assetForm.purchaseDate}
                          onChange={(e) => setAssetForm({...assetForm, purchaseDate: e.target.value})}
                          className="form-control glass-input w-100"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label text-white-50 small">Purchase Cost ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={assetForm.purchaseCost}
                          onChange={(e) => setAssetForm({...assetForm, purchaseCost: e.target.value})}
                          className="form-control glass-input w-100"
                          placeholder="e.g. 1200.00"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label text-white-50 small">Warranty Expiry</label>
                        <input
                          type="date"
                          value={assetForm.warrantyExpiry}
                          onChange={(e) => setAssetForm({...assetForm, warrantyExpiry: e.target.value})}
                          className="form-control glass-input w-100"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label text-white-50 small">AMC Expiry</label>
                        <input
                          type="date"
                          value={assetForm.amcExpiry}
                          onChange={(e) => setAssetForm({...assetForm, amcExpiry: e.target.value})}
                          className="form-control glass-input w-100"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer border-0 p-3 pt-0">
                    <button type="button" className="btn btn-outline-secondary rounded-3 text-white px-3" onClick={() => setShowAssetModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-premium px-4">Save Asset</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Assign Asset Modal */}
        {showAssignModal && assigningAsset && (
          <div className="modal d-block spinner-overlay" style={{ background: 'rgba(15, 23, 42, 0.8)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content glass-panel" style={{ background: 'rgba(30, 41, 59, 0.98)' }}>
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title text-white fw-bold">Assign Asset: {assigningAsset.assetName}</h5>
                  <button type="button" className="btn btn-link text-white p-0 border-0" onClick={() => setShowAssignModal(false)}>
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleAssignSubmit}>
                  <div className="modal-body p-4">
                    {errorMsg && (
                      <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger d-flex align-items-center gap-2 rounded-3 py-2 small mb-3">
                        <AlertCircle size={16} />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label text-white-50 small">Select Employee</label>
                      <select
                        value={assignForm.employeeId}
                        onChange={(e) => setAssignForm({...assignForm, employeeId: e.target.value})}
                        className="form-select glass-input w-100"
                        required
                      >
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.employeeId})</option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label text-white-50 small">Expected Return Date</label>
                      <input
                        type="date"
                        value={assignForm.expectedReturnDate}
                        onChange={(e) => setAssignForm({...assignForm, expectedReturnDate: e.target.value})}
                        className="form-control glass-input w-100"
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label text-white-50 small">Remarks / Notes</label>
                      <textarea
                        value={assignForm.remarks}
                        onChange={(e) => setAssignForm({...assignForm, remarks: e.target.value})}
                        className="form-control glass-input w-100"
                        rows="3"
                        placeholder="Additional details..."
                      />
                    </div>
                  </div>

                  <div className="modal-footer border-0 p-3 pt-0">
                    <button type="button" className="btn btn-outline-secondary rounded-3 text-white px-3" onClick={() => setShowAssignModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-premium px-4">Confirm Assignment</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AssetManagement;
