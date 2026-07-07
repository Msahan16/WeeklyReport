import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/my-reports';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError('Login failed. Check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.shell}>
      <div style={styles.card}>
        <div style={styles.badge}>WeeklyReport</div>
        <h1 style={styles.title}>Sign in</h1>
        <p style={styles.subtitle}>Access your weekly reports and team dashboard.</p>
        {error ? <div style={styles.error}>{error}</div> : null}
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Email
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label style={styles.label}>
            Password
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p style={styles.footer}>
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  shell: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    background: 'linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)',
    padding: '24px',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    borderRadius: '24px',
    background: 'rgba(255,255,255,0.96)',
    padding: '32px',
    boxShadow: '0 24px 80px rgba(15, 23, 42, 0.25)',
  },
  badge: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '999px',
    background: '#dbeafe',
    color: '#1d4ed8',
    fontSize: '12px',
    fontWeight: 700,
    marginBottom: '18px',
  },
  title: {
    margin: '0 0 8px',
    fontSize: '34px',
    color: '#0f172a',
  },
  subtitle: {
    margin: '0 0 24px',
    color: '#475569',
  },
  form: {
    display: 'grid',
    gap: '16px',
  },
  label: {
    display: 'grid',
    gap: '8px',
    fontSize: '14px',
    color: '#0f172a',
    fontWeight: 600,
  },
  input: {
    border: '1px solid #cbd5e1',
    borderRadius: '14px',
    padding: '12px 14px',
    fontSize: '15px',
    outline: 'none',
  },
  button: {
    marginTop: '8px',
    border: 'none',
    borderRadius: '14px',
    padding: '14px 16px',
    background: '#0f172a',
    color: '#fff',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  error: {
    background: '#fee2e2',
    color: '#b91c1c',
    padding: '12px 14px',
    borderRadius: '12px',
    marginBottom: '16px',
  },
  footer: {
    marginTop: '18px',
    color: '#475569',
    fontSize: '14px',
  },
};

export default Login;
