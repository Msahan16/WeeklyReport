import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { toastError } from '../utils/swal';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';

const getDefaultWeek = () => {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - now.getDay() + 1);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = d => d.toISOString().split('T')[0];
  return { start: fmt(monday), end: fmt(sunday) };
};

const TeamDashboard = () => {
  const { start: defStart, end: defEnd } = getDefaultWeek();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({});
  const [workload, setWorkload] = useState([]);
  const [submissionStatus, setSubmissionStatus] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [weekStart, setWeekStart] = useState(defStart);
  const [weekEnd, setWeekEnd] = useState(defEnd);
  const [filterMember, setFilterMember] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ weekStart, weekEnd });
      if (filterMember) params.append('userId', filterMember);
      if (filterProject) params.append('projectId', filterProject);

      const [reportsRes, statsRes, workloadRes, submissionRes, recentRes, projectsRes] = await Promise.all([
        api.get(`/reports/team?${params.toString()}`),
        api.get(`/dashboard/stats?weekStart=${weekStart}&weekEnd=${weekEnd}`),
        api.get(`/dashboard/workload-by-project?weekStart=${weekStart}&weekEnd=${weekEnd}`),
        api.get(`/dashboard/submission-status?weekStart=${weekStart}&weekEnd=${weekEnd}`),
        api.get('/dashboard/recent-reports'),
        api.get('/projects'),
      ]);
      setReports(reportsRes.data);
      setStats(statsRes.data);
      setWorkload(workloadRes.data);
      setSubmissionStatus(submissionRes.data);
      setRecentReports(recentRes.data);
      setProjects(projectsRes.data);
    } catch (err) {
      toastError('Could not load dashboard data. Check your connection and session.');
    } finally {
      setLoading(false);
    }
  }, [weekStart, weekEnd, filterMember, filterProject]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Unique members from reports
  const allMembers = [...new Map(reports.map(r => [r.userId, { id: r.userId, name: r.userFullName || r.userEmail }])).values()];

  // Submission rate for compliance ring
  const complianceRate = stats.totalReports
    ? Math.round((stats.submittedReports / stats.totalReports) * 100)
    : 0;

  const pieData = [
    { name: 'Submitted', value: Number(stats.submittedReports) || 0 },
    { name: 'Draft', value: Number(stats.draftReports) || 0 },
  ];

  if (loading) return (
    <div style={styles.loadingShell}>
      <div style={styles.spinner} />
      <p style={{ color: '#64748b', marginTop: 16 }}>Loading dashboard…</p>
    </div>
  );

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.headerRow}>
        <div>
          <div style={styles.kicker}>Manager view</div>
          <h1 style={styles.title}>Team Dashboard</h1>
          <p style={styles.subtitle}>Weekly reports, submission compliance & workload insights.</p>
        </div>
      </div>

      {/* Filters bar */}
      <div style={styles.filtersBar}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Week Start</label>
          <input id="filter-week-start" type="date" value={weekStart} onChange={e => setWeekStart(e.target.value)} style={styles.filterInput} />
        </div>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Week End</label>
          <input id="filter-week-end" type="date" value={weekEnd} onChange={e => setWeekEnd(e.target.value)} style={styles.filterInput} />
        </div>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Team Member</label>
          <select id="filter-member" value={filterMember} onChange={e => setFilterMember(e.target.value)} style={styles.filterInput}>
            <option value="">All members</option>
            {allMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Project</label>
          <select id="filter-project" value={filterProject} onChange={e => setFilterProject(e.target.value)} style={styles.filterInput}>
            <option value="">All projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <button id="apply-filters-btn" style={styles.applyBtn} onClick={fetchData}>Apply</button>
      </div>

      {/* Summary stat cards */}
      <div style={styles.statsGrid}>
        <StatCard label="Total Reports" value={stats.totalReports ?? 0} color="#3b82f6" icon="📄" />
        <StatCard label="Submitted" value={stats.submittedReports ?? 0} color="#10b981" icon="✅" />
        <StatCard label="Drafts / Pending" value={stats.draftReports ?? 0} color="#f59e0b" icon="📝" />
        <StatCard label="Open Blockers" value={stats.openBlockers ?? 0} color="#ef4444" icon="🚧" />
        <StatCard label="Compliance Rate" value={`${complianceRate}%`} color="#8b5cf6" icon="📊" />
        <StatCard label="Total Hours" value={`${stats.totalHoursWorked ?? 0}h`} color="#06b6d4" icon="⏱" />
      </div>

      {/* Charts row */}
      <div style={styles.chartsRow}>
        {/* Submission status pie */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Submission Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {pieData.map((_, i) => <Cell key={i} fill={['#10b981', '#f59e0b'][i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Workload by project bar */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Workload by Project</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={workload} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="project" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="reports" name="Reports" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="hours" name="Hours" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Submission status by member */}
      {submissionStatus.length > 0 && (
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Report Submission Status by Member</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={submissionStatus} layout="vertical" margin={{ top: 0, right: 20, left: 80, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
              <Tooltip />
              <Legend />
              <Bar dataKey="submitted" name="Submitted" fill="#10b981" radius={[0, 4, 4, 0]} stackId="a" />
              <Bar dataKey="draft" name="Draft" fill="#f59e0b" radius={[0, 4, 4, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Reports table */}
      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>Weekly Reports ({reports.length})</h3>
        <div style={styles.reportList}>
          {reports.length === 0 ? (
            <div style={styles.empty}>No reports found for the selected filters.</div>
          ) : (
            reports.map(report => (
              <div key={report.id} style={styles.reportItem}>
                <div style={styles.reportLeft}>
                  <strong style={{ color: '#0f172a' }}>{report.userFullName || report.userEmail}</strong>
                  {report.projectName && (
                    <span style={styles.projectTag}>{report.projectName}</span>
                  )}
                  {report.blockers && (
                    <span style={styles.blockerTag}>🚧 Blocker</span>
                  )}
                </div>
                <div style={styles.reportRight}>
                  <span style={{ color: '#64748b', fontSize: 13 }}>
                    {report.weekStartDate} – {report.weekEndDate}
                  </span>
                  <StatusBadge status={report.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent activity feed */}
      {recentReports.length > 0 && (
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Recent Activity</h3>
          <div style={styles.reportList}>
            {recentReports.slice(0, 5).map(r => (
              <div key={r.id} style={{ ...styles.reportItem, background: 'transparent', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div>
                  <strong style={{ fontSize: 13, color: '#0f172a' }}>{r.userFullName || r.userEmail}</strong>
                  <span style={{ color: '#64748b', fontSize: 12, marginLeft: 8 }}>submitted a report</span>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, color, icon }) => (
  <div style={styles.statCard}>
    <div style={{ ...styles.statIcon, background: color + '18', color }}>{icon}</div>
    <div style={styles.statLabel}>{label}</div>
    <div style={{ ...styles.statValue, color }}>{value}</div>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    SUBMITTED: { bg: '#dcfce7', color: '#16a34a', label: 'Submitted' },
    DRAFT: { bg: '#fef9c3', color: '#a16207', label: 'Draft' },
  };
  const s = map[status] || map.DRAFT;
  return (
    <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
      {s.label}
    </span>
  );
};

const styles = {
  page: {
    maxWidth: 1150,
    margin: '0 auto',
    padding: '36px 24px 64px',
    fontFamily: "'Inter', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
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
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: 16,
  },
  kicker: {
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: 600,
    marginBottom: 6,
  },
  title: { margin: '0 0 6px', fontSize: 36, fontWeight: 800, color: '#0f172a' },
  subtitle: { margin: 0, color: '#64748b', fontSize: 15 },
  filtersBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'flex-end',
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 18,
    padding: '18px 22px',
    boxShadow: '0 2px 12px rgba(15,23,42,0.04)',
  },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: 4 },
  filterLabel: { fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' },
  filterInput: {
    border: '1.5px solid #e2e8f0',
    borderRadius: 10,
    padding: '8px 12px',
    fontSize: 13,
    color: '#0f172a',
    background: '#f8fafc',
    outline: 'none',
    minWidth: 140,
  },
  applyBtn: {
    padding: '9px 20px',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
    alignSelf: 'flex-end',
  },
  error: {
    background: '#fee2e2',
    color: '#b91c1c',
    padding: '12px 16px',
    borderRadius: 12,
    fontSize: 14,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 16,
  },
  statCard: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 18,
    padding: '18px 20px',
    boxShadow: '0 4px 16px rgba(15,23,42,0.05)',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    marginBottom: 10,
  },
  statLabel: { fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 600 },
  statValue: { fontSize: 28, fontWeight: 800 },
  chartsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: 20,
  },
  chartCard: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 18,
    padding: '22px 22px 14px',
    boxShadow: '0 4px 16px rgba(15,23,42,0.05)',
  },
  chartTitle: { margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#0f172a' },
  card: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 20,
    padding: '22px 24px',
    boxShadow: '0 4px 16px rgba(15,23,42,0.05)',
  },
  sectionTitle: { margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: '#0f172a' },
  reportList: { display: 'flex', flexDirection: 'column', gap: 8 },
  reportItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    borderRadius: 12,
    background: '#f8fafc',
    flexWrap: 'wrap',
  },
  reportLeft: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  reportRight: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  projectTag: {
    background: '#eff6ff',
    color: '#1d4ed8',
    borderRadius: 999,
    padding: '2px 8px',
    fontSize: 11,
    fontWeight: 700,
  },
  blockerTag: {
    background: '#fef2f2',
    color: '#dc2626',
    borderRadius: 999,
    padding: '2px 8px',
    fontSize: 11,
    fontWeight: 700,
  },
  empty: { color: '#64748b', padding: '16px 0', textAlign: 'center' },
};

export default TeamDashboard;
