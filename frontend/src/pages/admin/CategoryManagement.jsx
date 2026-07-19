import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { Plus, Edit2, Trash2, X, Check, Tag, AlertCircle } from 'lucide-react';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Input fields for adding
  const [newCatName, setNewCatName] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCat = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!newCatName.trim()) return;

    try {
      await api.post('/categories', {
        categoryName: newCatName
      });
      setNewCatName('');
      fetchCategories();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error creating category.');
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.categoryName);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id) => {
    setErrorMsg('');
    try {
      await api.put(`/categories/${id}`, {
        categoryName: editName
      });
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error updating category.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? Make sure no assets are mapped to it.')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category.');
    }
  };

  return (
    <Layout>
      <div className="container-fluid">
        <h3 className="text-white fw-bold mb-4">Category Management</h3>

        <div className="row g-4">
          {/* Add Category Form */}
          <div className="col-lg-4">
            <div className="glass-panel p-4">
              <h5 className="text-white mb-4 fw-bold d-flex align-items-center gap-2">
                <Tag className="text-primary" /> Add Category
              </h5>

              {errorMsg && (
                <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger d-flex align-items-center gap-2 rounded-3 py-2 small mb-3">
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleAddCat}>
                <div className="mb-4">
                  <label className="form-label text-white-50 small">Category Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Laptop, Scanner"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="form-control glass-input w-100"
                    required
                  />
                </div>

                <button type="submit" className="btn btn-premium w-100 py-2 d-flex align-items-center justify-content-center gap-2">
                  <Plus size={16} /> Add Category
                </button>
              </form>
            </div>
          </div>

          {/* Categories List */}
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
                      <th>Category Name</th>
                      <th style={{ width: '150px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan="2" className="text-center py-4 text-muted">No categories created yet.</td>
                      </tr>
                    ) : (
                      categories.map(c => (
                        <tr key={c.id}>
                          <td>
                            {editingId === c.id ? (
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="form-control glass-input py-1"
                              />
                            ) : (
                              <span className="fw-semibold text-white">{c.categoryName}</span>
                            )}
                          </td>
                          <td>
                            {editingId === c.id ? (
                              <div className="d-flex gap-2">
                                <button onClick={() => handleSaveEdit(c.id)} className="btn btn-sm btn-outline-success border-0 bg-success bg-opacity-10 text-success-hover">
                                  <Check size={14} />
                                </button>
                                <button onClick={cancelEdit} className="btn btn-sm btn-outline-light border-0 bg-secondary-subtle">
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <div className="d-flex gap-2">
                                <button onClick={() => startEdit(c)} className="btn btn-sm btn-outline-light border-0 bg-secondary-subtle" title="Edit">
                                  <Edit2 size={14} />
                                </button>
                                <button onClick={() => handleDelete(c.id)} className="btn btn-sm btn-outline-danger border-0 bg-danger bg-opacity-10 text-danger-hover" title="Delete">
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

export default CategoryManagement;
