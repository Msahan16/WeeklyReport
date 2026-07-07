import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const TeamDashboard = () => {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({});
  const [weekStart, setWeekStart] = useState('2026-07-01');
  const [weekEnd, setWeekEnd] = useState('2026-07-07');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [weekStart, weekEnd]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const reportsRes = await api.get(`/reports/team?weekStart=${weekStart}&weekEnd=${weekEnd}`);
      setReports(reportsRes.data);
      const statsRes = await api.get(`/dashboard/stats?weekStart=${weekStart}&weekEnd=${weekEnd}`);
      setStats(statsRes.data);
    } catch (err) {
      setError('Could not load dashboard data. Check the backend connection and login state.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.page}>Loading dashboard...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <div>
          <div style={styles.kicker}>Manager view</div>
          <h1 style={styles.title}>Team Dashboard</h1>
          <p style={styles.subtitle}>Review weekly submissions and the current reporting pulse.</p>
        </div>
        <div style={styles.filters}>
          <input type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} />
          <input type="date" value={weekEnd} onChange={(e) => setWeekEnd(e.target.value)} />
          <button onClick={fetchData}>Apply</button>
        </div>
      </div>

      {error ? <div style={styles.error}>{error}</div> : null}

      <div style={styles.statsGrid}>
        <Stat label="Total Reports" value={stats.totalReports ?? 0} />
        <Stat label="Submitted" value={stats.submittedReports ?? 0} />
        <Stat label="Drafts" value={stats.draftReports ?? 0} />
        <Stat label="Total Hours" value={stats.totalHoursWorked ?? 0} />
        <Stat label="Average Hours" value={stats.averageHoursWorked ?? 0} />
      </div>

      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>Weekly Reports</h3>
        <div style={styles.reportList}>
          {reports.length === 0 ? (
            <div style={styles.empty}>No reports found for the selected week.</div>
          ) : (
            reports.map((report) => (
              <div key={report.id} style={styles.reportItem}>
                <div>
                  <strong>{report.userFullName || report.userEmail}</strong>
                  <div style={styles.muted}>{report.projectName || 'No project assigned'}</div>
                </div>
                <div style={styles.muted}>
                  {report.weekStartDate} to {report.weekEndDate} • {report.status}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div style={styles.statCard}>
    <div style={styles.statLabel}>{label}</div>
    <div style={styles.statValue}>{value}</div>
  </div>
);

const styles = {
  page: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '32px 24px 48px',
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    flexWrap: 'wrap',
    alignItems: 'end',
    marginBottom: '24px',
  },
  kicker: {
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    fontSize: '12px',
    color: '#64748b',
    marginBottom: '8px',
  },
  title: {
    margin: 0,
    fontSize: '40px',
    color: '#0f172a',
  },
  subtitle: {
    margin: '8px 0 0',
    color: '#475569',
  },
  filters: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '18px',
    padding: '18px',
    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.05)',
  },
  statLabel: {
    fontSize: '13px',
    color: '#64748b',
    marginBottom: '10px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 800,
    color: '#0f172a',
  },
  card: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    padding: '22px',
    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.05)',
  },
  sectionTitle: {
    margin: '0 0 16px',
    fontSize: '20px',
  },
  reportList: {
    display: 'grid',
    gap: '12px',
  },
  reportItem: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    padding: '14px 16px',
    borderRadius: '14px',
    background: '#f8fafc',
    flexWrap: 'wrap',
  },
  muted: {
    color: '#64748b',
    fontSize: '14px',
    marginTop: '4px',
  },
  empty: {
    color: '#64748b',
    padding: '8px 0',
  },
  error: {
    background: '#fee2e2',
    color: '#b91c1c',
    padding: '12px 14px',
    borderRadius: '12px',
    marginBottom: '16px',
  },
};

export default TeamDashboard;
