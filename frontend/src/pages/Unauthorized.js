import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => (
  <div style={styles.shell}>
    <div style={styles.card}>
      <div style={styles.badge}>Access denied</div>
      <h1 style={styles.title}>You do not have access to this page.</h1>
      <p style={styles.text}>Switch to a manager account or return to your reports.</p>
      <Link to="/my-reports" style={styles.link}>Go to My Reports</Link>
    </div>
  </div>
);

const styles = {
  shell: {
    minHeight: '70vh',
    display: 'grid',
    placeItems: 'center',
    padding: '24px',
  },
  card: {
    maxWidth: '560px',
    width: '100%',
    border: '1px solid #e2e8f0',
    borderRadius: '24px',
    padding: '32px',
    background: '#fff',
    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.06)',
  },
  badge: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '999px',
    background: '#fee2e2',
    color: '#b91c1c',
    fontSize: '12px',
    fontWeight: 700,
    marginBottom: '16px',
  },
  title: {
    margin: '0 0 12px',
    fontSize: '32px',
  },
  text: {
    margin: '0 0 20px',
    color: '#475569',
  },
  link: {
    display: 'inline-block',
    textDecoration: 'none',
    background: '#0f172a',
    color: '#fff',
    padding: '12px 16px',
    borderRadius: '12px',
    fontWeight: 700,
  },
};

export default Unauthorized;