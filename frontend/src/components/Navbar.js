import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <header style={styles.header}>
      <Link to="/my-reports" style={styles.brand}>WeeklyReport</Link>
      <nav style={styles.nav}>
        {user ? (
          <>
            <Link to="/my-reports" style={styles.link}>My Reports</Link>
            <Link to="/reports/new" style={styles.link}>New Report</Link>
            {user.role === 'MANAGER' ? (
              <>
                <Link to="/dashboard" style={styles.link}>Dashboard</Link>
                <Link to="/projects" style={styles.link}>Projects</Link>
              </>
            ) : null}
            <button type="button" onClick={logout} style={styles.button}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 24px',
    borderBottom: '1px solid #e2e8f0',
    background: '#fff',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  brand: {
    textDecoration: 'none',
    color: '#0f172a',
    fontWeight: 800,
    fontSize: '18px',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  link: {
    textDecoration: 'none',
    color: '#0f172a',
    fontWeight: 600,
  },
  button: {
    border: '1px solid #cbd5e1',
    background: '#f8fafc',
    color: '#0f172a',
    borderRadius: '999px',
    padding: '8px 14px',
    cursor: 'pointer',
    fontWeight: 700,
  },
};

export default Navbar;