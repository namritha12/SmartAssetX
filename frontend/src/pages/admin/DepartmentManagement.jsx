import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { Plus, Edit2, Trash2, X, Check, FolderOpen, AlertCircle } from 'lucide-react';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Input fields for adding
  const [newDeptName, setNewDeptName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/departments');
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load departments.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDept = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!newDeptName.trim()) return;

    try {
      await api.post('/departments', {
        departmentName: newDeptName,
        description: newDescription
      });
      setNewDeptName('');
      setNewDescription('');
      fetchDepartments();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error creating department.');
    }
  };

  const startEdit = (dept) => {
    setEditingId(dept.id);
    setEditName(dept.departmentName);
    setEditDesc(dept.description || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id) => {
    setErrorMsg('');
    try {
      await api.put(`/departments/${id}`, {
        departmentName: editName,
        description: editDesc
      });
      setEditingId(null);
      fetchDepartments();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error updating department.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department? Make sure no users or assets are currently mapped to it.')) return;
    try {
      await api.delete(`/departments/${id}`);
      fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete department.');
    }
  };

  return (
    <Layout>
      <div className="container-fluid">
        <h3 className="text-white fw-bold mb-4">Department Management</h3>

        <div className="row g-4">
          {/* Add Department Form */}
          <div className="col-lg-4">
            <div className="glass-panel p-4">
              <h5 className="text-white mb-4 fw-bold d-flex align-items-center gap-2">
                <FolderOpen className="text-primary" /> Add Department
              </h5>

              {errorMsg && (
                <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger d-flex align-items-center gap-2 rounded-3 py-2 small mb-3">
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleAddDept}>
                <div className="mb-3">
                  <label className="form-label text-white-50 small">Department Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sales, Marketing"
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    className="form-control glass-input w-100"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label text-white-50 small">Description</label>
                  <textarea
                    placeholder="Description..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="form-control glass-input w-100"
                    rows="3"
                  />
                </div>

                <button type="submit" className="btn btn-premium w-100 py-2 d-flex align-items-center justify-content-center gap-2">
                  <Plus size={16} /> Add Department
                </button>
              </form>
            </div>
          </div>

          {/* Departments List */}
          <div className="col-lg-8">
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
                      <th>Name</th>
                      <th>Description</th>
                      <th style={{ width: '150px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center py-4 text-muted">No departments created yet.</td>
                      </tr>
                    ) : (
                      departments.map(d => (
                        <tr key={d.id}>
                          <td>
                            {editingId === d.id ? (
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="form-control glass-input py-1"
                              />
                            ) : (
                              <span className="fw-semibold text-white">{d.departmentName}</span>
                            )}
                          </td>
                          <td>
                            {editingId === d.id ? (
                              <input
                                type="text"
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                className="form-control glass-input py-1"
                              />
                            ) : (
                              d.description || 'No description'
                            )}
                          </td>
                          <td>
                            {editingId === d.id ? (
                              <div className="d-flex gap-2">
                                <button onClick={() => handleSaveEdit(d.id)} className="btn btn-sm btn-outline-success border-0 bg-success bg-opacity-10 text-success-hover">
                                  <Check size={14} />
                                </button>
                                <button onClick={cancelEdit} className="btn btn-sm btn-outline-light border-0 bg-secondary-subtle">
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <div className="d-flex gap-2">
                                <button onClick={() => startEdit(d)} className="btn btn-sm btn-outline-light border-0 bg-secondary-subtle" title="Edit">
                                  <Edit2 size={14} />
                                </button>
                                <button onClick={() => handleDelete(d.id)} className="btn btn-sm btn-outline-danger border-0 bg-danger bg-opacity-10 text-danger-hover" title="Delete">
                                  <Trash2 size={14} />
                                </button>
                              </div>
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
        </div>
      </div>
    </Layout>
  );
};

export default DepartmentManagement;
