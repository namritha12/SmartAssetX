import React, { useEffect, useState } from 'react';
import { Menu, Bell, User } from 'lucide-react';
import api from '../utils/api';

const Navbar = ({ onToggleSidebar }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [toasts, setToasts] = useState([]);

  const userString = localStorage.getItem('user');
  let user = { role: 'EMPLOYEE', fullName: 'User' };
  if (userString) {
    try { 
      user = JSON.parse(userString); 
    } catch(e) {
      // Ignored
    }
  }

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications/unread');
      const unreadList = response.data;
      
      if (unreadList.length > 0) {
        unreadList.forEach(notif => {
          showToast(notif.message, notif.id);
        });
      }
      setNotifications(unreadList);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const showToast = (message, id) => {
    // Prevent duplicate toasts
    setToasts(prev => {
      if (prev.some(t => t.id === id)) return prev;
      return [...prev, { id, message }];
    });

    // Mark read immediately on backend
    api.put(`/notifications/${id}/read`).catch(err => console.error(err));

    // Dismiss toast after 6 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 6000);
  };

  useEffect(() => {
    // Fetch immediately on mount
    fetchNotifications();

    // Poll every 10 seconds
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <nav className="navbar navbar-expand-lg glass-panel px-4 py-3 mb-4 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-dark d-lg-none p-2 rounded-3 border-0 bg-secondary" onClick={onToggleSidebar}>
            <Menu size={20} className="text-white" />
          </button>
          <h4 className="mb-0 fw-semibold text-white">SmartAssetX Portal</h4>
        </div>

        <div className="d-flex align-items-center gap-3">
          {/* Notifications Bell */}
          <div className="position-relative" style={{ cursor: 'pointer' }}>
            <div 
              className="p-2 rounded-3 bg-opacity-10 bg-white" 
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            >
              <Bell size={20} className="text-white" />
              {notifications.length > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {notifications.length}
                </span>
              )}
            </div>

            {showNotifDropdown && (
              <div 
                className="position-absolute end-0 mt-2 glass-panel p-3 shadow-lg" 
                style={{ width: '280px', zIndex: 1000, background: 'rgba(30, 41, 59, 0.95)' }}
              >
                <h6 className="text-white mb-3 fw-bold">Notifications</h6>
                {notifications.length === 0 ? (
                  <p className="text-muted mb-0 small">No new notifications</p>
                ) : (
                  <div className="d-flex flex-column gap-2 overflow-y-auto" style={{ maxHeight: '200px' }}>
                    {notifications.map(n => (
                      <div key={n.id} className="p-2 border-bottom border-secondary small text-white-50">
                        {n.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="d-flex align-items-center gap-2">
            <div className="p-2 rounded-3 bg-opacity-10 bg-white">
              <User size={20} className="text-white" />
            </div>
            <span className="text-white-50 d-none d-md-inline small">{user.fullName}</span>
          </div>
        </div>
      </nav>

      {/* CSS-Animated Floaters */}
      <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {toasts.map(toast => (
          <div key={toast.id} className="custom-toast">
            <span className="text-white font-medium">{toast.message}</span>
          </div>
        ))}
      </div>
    </>
  );
};

export default Navbar;
