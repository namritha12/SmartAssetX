import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Laptop, 
  Users, 
  FolderTree, 
  Tags, 
  FileBarChart, 
  User, 
  LogOut, 
  GitPullRequest, 
  History, 
  PlusCircle 
} from 'lucide-react';

const Sidebar = ({ activeMobile, setActiveMobile }) => {
  const navigate = useNavigate();
  const userString = localStorage.getItem('user');
  let user = { role: 'EMPLOYEE', fullName: 'User' };

  if (userString) {
    try {
      user = JSON.parse(userString);
    } catch (e) {
      // Ignored
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getLinksByRole = () => {
    switch (user.role) {
      case 'ADMIN':
        return [
          { to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
          { to: '/admin/assets', label: 'Asset Management', icon: <Laptop size={20} /> },
          { to: '/admin/users', label: 'User Management', icon: <Users size={20} /> },
          { to: '/admin/departments', label: 'Departments', icon: <FolderTree size={20} /> },
          { to: '/admin/categories', label: 'Categories', icon: <Tags size={20} /> },
          { to: '/admin/reports', label: 'Reports', icon: <FileBarChart size={20} /> },
        ];
      case 'MANAGER':
        return [
          { to: '/manager', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
          { to: '/manager/requests', label: 'Asset Requests', icon: <GitPullRequest size={20} /> },
          { to: '/manager/department-assets', label: 'Dept Assets', icon: <Laptop size={20} /> },
        ];
      case 'EMPLOYEE':
        default:
        return [
          { to: '/employee', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
          { to: '/employee/assets', label: 'My Assets', icon: <Laptop size={20} /> },
          { to: '/employee/request-asset', label: 'Request Asset', icon: <PlusCircle size={20} /> },
          { to: '/employee/request-history', label: 'Request History', icon: <History size={20} /> },
        ];
    }
  };

  const links = getLinksByRole();

  return (
    <div className={`floating-sidebar glass-panel d-flex flex-column p-3 ${activeMobile ? 'active' : ''}`}>
      {/* Brand Logo */}
      <div className="d-flex align-items-center gap-2 mb-4 px-2">
        <div 
          className="bg-primary rounded-3 d-flex align-items-center justify-content-center" 
          style={{ width: '40px', height: '40px', background: 'var(--primary-gradient)' }}
        >
          <span className="fw-bold text-white fs-4">S</span>
        </div>
        <div>
          <h5 className="mb-0 fw-bold text-white">SmartAsset<span className="text-primary" style={{ color: '#6366f1' }}>X</span></h5>
          <small className="text-muted" style={{ fontSize: '0.7rem' }}>ENTERPRISE ASSETS</small>
        </div>
      </div>

      <hr className="bg-secondary opacity-25 mt-0 mb-4" />

      {/* Navigation Links */}
      <div className="flex-grow-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end
            onClick={() => setActiveMobile(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>

      <hr className="bg-secondary opacity-25" />

      {/* User profile & Logout */}
      <div className="sidebar-footer">
        <NavLink 
          to="/profile" 
          onClick={() => setActiveMobile(false)}
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          style={{ marginBottom: '8px' }}
        >
          <User size={20} />
          <div className="text-truncate" style={{ maxWidth: '160px' }}>
            <span className="d-block text-white fw-medium">{user.fullName}</span>
            <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>{user.role}</small>
          </div>
        </NavLink>

        <button 
          onClick={handleLogout}
          className="btn btn-link sidebar-link w-100 text-start border-0 bg-transparent text-danger-hover"
          style={{ cursor: 'pointer' }}
        >
          <LogOut size={20} className="text-danger" />
          <span className="text-danger">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
