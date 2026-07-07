import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { alertSuccess, alertError } from '../utils/swal';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'TEAM_MEMBER',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      await alertSuccess('Account Created!', 'Registration successful. Please log in.');
      navigate('/login');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      alertError('Registration Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="John Doe"
              id="register-fullname"
            />
          </div>
          <div style={styles.field}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="you@example.com"
              id="register-email"
            />
          </div>
          <div style={styles.field}>
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Min 6 characters"
              minLength="6"
              id="register-password"
            />
          </div>
          <div style={styles.field}>
            <label>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={styles.input}
              id="register-role"
            >
              <option value="TEAM_MEMBER">Team Member</option>
              <option value="MANAGER">Manager</option>
            </select>
            <small style={styles.hint}>Manager role gives access to dashboard &amp; project management.</small>
          </div>
          <button type="submit" disabled={loading} style={styles.button} id="register-submit-btn">
            {loading ? 'Registering…' : 'Register'}
          </button>
        </form>
        <p style={styles.footer}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)',
    padding: '24px',
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 24px 80px rgba(15,23,42,0.25)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '24px',
    color: '#0f172a',
    fontSize: '28px',
    fontWeight: 800,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#374151',
  },
  input: {
    padding: '10px 12px',
    borderRadius: '12px',
    border: '1.5px solid #cbd5e1',
    fontSize: '15px',
    outline: 'none',
    fontFamily: 'inherit',
  },
  button: {
    padding: '12px',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '8px',
    boxShadow: '0 4px 14px rgba(59,130,246,0.4)',
  },
  footer: {
    textAlign: 'center',
    marginTop: '16px',
    fontSize: '14px',
    color: '#475569',
  },
  hint: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '2px',
  },
};

export default Register;