import React, { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import api from '../../utils/api';
import { 
  Plus, 
  User, 
  Mail, 
  Shield, 
  Phone, 
  UserCheck, 
  UserMinus, 
  X, 
  AlertCircle 
} from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields
  const [userForm, setUserForm] = useState({
    employeeId: '',
    fullName: '',
    email: '',
    password: '',
    phone: '',
    designation: '',
    role: 'EMPLOYEE',
    departmentId: ''
  });

  useEffect(() => {
    loadUsersAndDepartments();
  }, []);

  const loadUsersAndDepartments = async () => {
    try {
      setLoading(true);
      const [usersRes, deptRes] = await Promise.all([
        api.get('/auth/users'),
        api.get('/departments')
      ]);
      setUsers(usersRes.data);
      setDepartments(deptRes.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load user directories.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (!window.confirm(`Are you sure you want to change user status to ${nextStatus}?`)) return;

    try {
      await api.put(`/auth/users/${id}/status?status=${nextStatus}`);
      loadUsersAndDepartments();
    } catch (err) {
      alert('Error updating user status.');
    }
  };

  const handleOpenAddModal = () => {
    setUserForm({
      employeeId: '',
      fullName: '',
      email: '',
      password: '',
      phone: '',
      designation: '',
      role: 'EMPLOYEE',
      departmentId: departments[0]?.id || ''
    });
    setErrorMsg('');
    setShowAddModal(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const payload = {
        ...userForm,
        departmentId: userForm.departmentId ? parseInt(userForm.departmentId) : null
      };

      await api.post('/auth/users', payload);
      setShowAddModal(false);
      loadUsersAndDepartments();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create user account.');
    }
  };

  return (
    <Layout>
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="text-white fw-bold mb-0">User Directory</h3>
          <button onClick={handleOpenAddModal} className="btn btn-premium d-flex align-items-center gap-2">
            <Plus size={18} /> Register New User
          </button>
        </div>

        {/* Directory Listing */}
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
                  <th>Employee ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Status</th>
                  <th>Toggle Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map(userItem => (
                  <tr key={userItem.id}>
                    <td className="fw-semibold text-white">{userItem.employeeId}</td>
                    <td>{userItem.fullName}</td>
                    <td>{userItem.email}</td>
                    <td>
                      <span className={`badge ${
                        userItem.role === 'ADMIN' ? 'bg-danger' :
                        userItem.role === 'MANAGER' ? 'bg-warning' :
                        'bg-secondary'
                      } text-white`}>{userItem.role}</span>
                    </td>
                    <td>{userItem.departmentName || 'N/A'}</td>
                    <td>{userItem.designation || 'N/A'}</td>
                    <td>
                      <span className={`badge ${userItem.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'} text-white`}>
                        {userItem.status}
                      </span>
                    </td>
                    <td>
                      {userItem.role !== 'ADMIN' ? (
                        <button 
                          onClick={() => handleToggleStatus(userItem.id, userItem.status)} 
                          className={`btn btn-sm rounded-3 border-0 d-flex align-items-center gap-1 ${
                            userItem.status === 'ACTIVE' ? 'btn-outline-danger bg-danger bg-opacity-10 text-danger-hover' : 'btn-outline-success bg-success bg-opacity-10 text-success-hover'
                          }`}
                        >
                          {userItem.status === 'ACTIVE' ? (
                            <><UserMinus size={14} /> Deactivate</>
                          ) : (
                            <><UserCheck size={14} /> Activate</>
                          )}
                        </button>
                      ) : (
                        <span className="text-muted small">Access Lock</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Register User Modal */}
        {showAddModal && (
          <div className="modal d-block spinner-overlay" style={{ background: 'rgba(15, 23, 42, 0.8)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content glass-panel" style={{ background: 'rgba(30, 41, 59, 0.98)' }}>
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title text-white fw-bold">Register Manager or Employee</h5>
                  <button type="button" className="btn btn-link text-white p-0 border-0" onClick={() => setShowAddModal(false)}>
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleCreateUser}>
                  <div className="modal-body p-4">
                    {errorMsg && (
                      <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger d-flex align-items-center gap-2 rounded-3 py-2 small mb-3">
                        <AlertCircle size={16} />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label text-white-50 small">Employee ID</label>
                        <input
                          type="text"
                          value={userForm.employeeId}
                          onChange={(e) => setUserForm({...userForm, employeeId: e.target.value})}
                          className="form-control glass-input w-100"
                          placeholder="e.g. EMP005"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label text-white-50 small">Full Name</label>
                        <input
                          type="text"
                          value={userForm.fullName}
                          onChange={(e) => setUserForm({...userForm, fullName: e.target.value})}
                          className="form-control glass-input w-100"
                          placeholder="John Doe"
                          required
                        />
                      </div>

                      <div className="col-md-12">
                        <label className="form-label text-white-50 small">Email Address</label>
                        <input
                          type="email"
                          value={userForm.email}
                          onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                          className="form-control glass-input w-100"
                          placeholder="john.doe@company.com"
                          required
                        />
                      </div>

                      <div className="col-md-12">
                        <label className="form-label text-white-50 small">Temporary Password</label>
                        <input
                          type="password"
                          value={userForm.password}
                          onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                          className="form-control glass-input w-100"
                          placeholder="••••••••"
                          required
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label text-white-50 small">System Role</label>
                        <select
                          value={userForm.role}
                          onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                          className="form-select glass-input w-100"
                          required
                        >
                          <option value="EMPLOYEE">EMPLOYEE</option>
                          <option value="MANAGER">MANAGER</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label text-white-50 small">Department</label>
                        <select
                          value={userForm.departmentId}
                          onChange={(e) => setUserForm({...userForm, departmentId: e.target.value})}
                          className="form-select glass-input w-100"
                        >
                          <option value="">No Department</option>
                          {departments.map(d => (
                            <option key={d.id} value={d.id}>{d.departmentName}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label text-white-50 small">Designation</label>
                        <input
                          type="text"
                          value={userForm.designation}
                          onChange={(e) => setUserForm({...userForm, designation: e.target.value})}
                          className="form-control glass-input w-100"
                          placeholder="e.g. Lead QA Developer"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label text-white-50 small">Phone Number</label>
                        <input
                          type="text"
                          value={userForm.phone}
                          onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                          className="form-control glass-input w-100"
                          placeholder="+1 555-0192"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="modal-footer border-0 p-3 pt-0">
                    <button type="button" className="btn btn-outline-secondary rounded-3 text-white px-3" onClick={() => setShowAddModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-premium px-4">Register User</button>
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

export default UserManagement;
