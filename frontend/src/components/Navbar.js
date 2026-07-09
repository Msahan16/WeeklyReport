import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { confirmDialog } from '../utils/swal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  const isActive = (path) => location.pathname.startsWith(path) ? 'nav-link active' : 'nav-link';

  const handleLogout = async () => {
    const confirmed = await confirmDialog({
      title: 'Sign out?',
      text: 'Are you sure you want to log out?',
      confirmText: 'Yes, log out',
      icon: 'question'
    });
    if (confirmed) {
      logout();
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.trim().substring(0, 2).toUpperCase();
  };

  return (
    <header className="navbar">
      <Link to={user?.role === 'MANAGER' ? '/dashboard' : '/my-reports'} className="nav-brand">
        <div className="nav-brand-icon">W</div>
        WeeklyReport
      </Link>
      
      <div className="nav-right-container">
        <nav className="nav-links">
          {user ? (
            <>
              {user.role !== 'MANAGER' && (
                <>
                  <Link to="/my-reports" className={isActive('/my-reports')}>My Reports</Link>
                  <Link to="/reports/new" className={isActive('/reports/new')}>New Report</Link>
                </>
              )}
              {user.role === 'MANAGER' && (
                <>
                  <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
                  <Link to="/team-reports" className={isActive('/team-reports')}>Team Reports</Link>
                  <Link to="/projects" className={isActive('/projects')}>Projects</Link>
                </>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          )}
        </nav>

        {user && (
          <div className="nav-actions">
            <div className="user-profile">
              <div className="user-avatar" title={user.fullName}>
                {getInitials(user.fullName)}
              </div>
              <div className="user-info">
                <span className="user-name">{user.fullName || 'User'}</span>
                <span className="user-role">{user.role?.replace('_', ' ').toLowerCase() || 'Team Member'}</span>
              </div>
            </div>
            <button type="button" onClick={handleLogout} className="btn-logout" id="logout-btn">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;