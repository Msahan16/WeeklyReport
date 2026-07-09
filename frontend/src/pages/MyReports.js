import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import { toastError } from '../utils/swal';

const STATUS_COLORS = {
  SUBMITTED: { bg: '#dcfce7', color: '#16a34a', label: 'Submitted' },
  DRAFT: { bg: '#fef9c3', color: '#a16207', label: 'Draft' },
};

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/reports/my')
      .then(res => setReports(res.data))
      .catch(() => toastError('Could not load your reports.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={styles.loadingShell}>
      <div style={styles.spinner} />
      <p style={{ color: '#64748b', marginTop: 16 }}>Loading your reports…</p>
    </div>
  );

  return (
    <div style={styles.page} className="page-container">
      {/* Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.kicker}>Personal workspace</div>
          <h1 style={styles.title}>My Weekly Reports</h1>
          <p style={styles.subtitle}>Track your work history and stay on top of weekly submissions.</p>
        </div>
        <Link to="/reports/new" style={{ textDecoration: 'none' }}>
          <button style={styles.newBtn} id="create-report-btn">
            <span style={{ fontSize: 18, lineHeight: 1 }}>＋</span> New Report
          </button>
        </Link>
      </div>

      {reports.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📋</div>
          <h3 style={styles.emptyTitle}>No reports yet</h3>
          <p style={styles.emptyText}>Create your first weekly report to get started.</p>
         
        </div>
      ) : (
        <div style={styles.reportGrid}>
          {reports.map(r => {
            const s = STATUS_COLORS[r.status] || STATUS_COLORS.DRAFT;
            return (
              <div key={r.id} style={styles.card}>
                <div style={styles.cardTop}>
                  <div>
                    <div style={styles.weekRange}>
                      📅 {r.weekStartDate} → {r.weekEndDate}
                    </div>
                    {r.projectName && (
                      <span style={styles.projectTag}>{r.projectName}</span>
                    )}
                  </div>
                  <span style={{ ...styles.badge, background: s.bg, color: s.color }}>
                    {s.label}
                  </span>
                </div>

                {r.tasksCompleted && (
                  <div style={styles.section}>
                    <div style={styles.sectionLabel}>✅ Tasks Completed</div>
                    <div style={styles.sectionText}>{r.tasksCompleted}</div>
                  </div>
                )}

                {r.blockers && (
                  <div style={styles.section}>
                    <div style={{ ...styles.sectionLabel, color: '#dc2626' }}>🚧 Blockers</div>
                    <div style={styles.sectionText}>{r.blockers}</div>
                  </div>
                )}

                <div style={styles.cardFooter}>
                  {r.hoursWorked != null && r.hoursWorked > 0 && (
                    <span style={styles.hours}>⏱ {r.hoursWorked}h</span>
                  )}
                  <button
                    style={styles.editBtn}
                    id={`edit-report-${r.id}`}
                    onClick={() => navigate(`/reports/${r.id}/edit`)}
                  >
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  page: {
    maxWidth: '100%',
    margin: '0 auto',
    padding: '36px 24px 56px',
    fontFamily: "'Inter', sans-serif",
  },
  loadingShell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '50vh',
  },
  spinner: {
    width: 40,
    height: 40,
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  kicker: {
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 6,
    fontWeight: 600,
  },
  title: {
    margin: '0 0 6px',
    fontSize: 36,
    fontWeight: 800,
    color: '#0f172a',
  },
  subtitle: {
    margin: 0,
    color: '#64748b',
    fontSize: 15,
  },
  newBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 22px',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: '#fff',
    border: 'none',
    borderRadius: 14,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(59,130,246,0.4)',
  },
  emptyState: {
    textAlign: 'center',
    padding: '64px 24px',
    background: '#f8fafc',
    borderRadius: 20,
    border: '2px dashed #e2e8f0',
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { margin: '0 0 8px', fontSize: 22, color: '#0f172a' },
  emptyText: { color: '#64748b', marginBottom: 24 },
  reportGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: 20,
  },
  card: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 18,
    padding: 22,
    boxShadow: '0 4px 20px rgba(15,23,42,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  weekRange: {
    fontWeight: 700,
    color: '#0f172a',
    fontSize: 14,
    marginBottom: 6,
  },
  projectTag: {
    display: 'inline-block',
    background: '#eff6ff',
    color: '#1d4ed8',
    borderRadius: 999,
    padding: '2px 10px',
    fontSize: 12,
    fontWeight: 600,
  },
  badge: {
    padding: '4px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },
  section: { display: 'flex', flexDirection: 'column', gap: 4 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: '#64748b',
  },
  sectionText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 1.6,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 12,
    borderTop: '1px solid #f1f5f9',
  },
  hours: { fontSize: 13, color: '#64748b', fontWeight: 600 },
  editBtn: {
    padding: '7px 16px',
    background: '#f1f5f9',
    color: '#0f172a',
    border: 'none',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
  },
};

export default MyReports;