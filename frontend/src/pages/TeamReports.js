import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { toastError } from '../utils/swal';

const getDefaultWeek = () => {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - now.getDay() + 1);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = d => d.toISOString().split('T')[0];
  return { start: fmt(monday), end: fmt(sunday) };
};

const TeamReports = () => {
  const { start: defStart, end: defEnd } = getDefaultWeek();
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [weekStart, setWeekStart] = useState(defStart);
  const [weekEnd, setWeekEnd] = useState(defEnd);
  const [filterMember, setFilterMember] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedReportId, setExpandedReportId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ weekStart, weekEnd });
      if (filterMember) params.append('userId', filterMember);
      if (filterProject) params.append('projectId', filterProject);

      const [reportsRes, projectsRes, membersRes] = await Promise.all([
        api.get(`/reports/team?${params.toString()}`),
        api.get('/projects'),
        api.get('/dashboard/team-members'),
      ]);
      setReports(reportsRes.data);
      setProjects(projectsRes.data);
      setAllMembers(membersRes.data);
    } catch (err) {
      toastError('Could not load reports.');
    } finally {
      setLoading(false);
    }
  }, [weekStart, weekEnd, filterMember, filterProject]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return (
    <div style={styles.loadingShell}>
      <div style={styles.spinner} />
      <p style={{ color: '#64748b', marginTop: 16 }}>Loading team reports…</p>
    </div>
  );

  return (
    <div style={styles.page} className="page-container">
      <div style={styles.headerRow}>
        <div>
          <div style={styles.kicker}>Manager view</div>
          <h1 style={styles.title}>Team Reports</h1>
          <p style={styles.subtitle}>Browse and filter individual weekly reports from your team.</p>
        </div>
      </div>

      <div className="responsive-filters" style={styles.filtersBar}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Week Start</label>
          <input type="date" value={weekStart} onChange={e => setWeekStart(e.target.value)} style={styles.filterInput} />
        </div>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Week End</label>
          <input type="date" value={weekEnd} onChange={e => setWeekEnd(e.target.value)} style={styles.filterInput} />
        </div>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Team Member</label>
          <select value={filterMember} onChange={e => setFilterMember(e.target.value)} style={styles.filterInput}>
            <option value="">All members</option>
            {allMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Project</label>
          <select value={filterProject} onChange={e => setFilterProject(e.target.value)} style={styles.filterInput}>
            <option value="">All projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <button style={styles.applyBtn} onClick={fetchData}>Apply Filters</button>
      </div>

      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>Reports ({reports.length})</h3>
        <div style={styles.reportList}>
          {reports.length === 0 ? (
            <div style={styles.empty}>No reports found for the selected filters.</div>
          ) : (
            reports.map(report => (
              <div key={report.id} style={{ ...styles.reportItem, flexDirection: 'column', alignItems: 'stretch' }}>
                <div 
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', flexWrap: 'wrap', gap: 12 }} 
                  onClick={() => setExpandedReportId(expandedReportId === report.id ? null : report.id)}
                >
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
                    <span style={{ marginLeft: 8, color: '#94a3b8', fontSize: 12 }}>
                      {expandedReportId === report.id ? '▲' : '▼'}
                    </span>
                  </div>
                </div>
                
                {expandedReportId === report.id && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {report.tasksCompleted && (
                      <div>
                        <div style={styles.sectionLabel}>✅ Tasks Completed</div>
                        <div style={styles.sectionText}>{report.tasksCompleted}</div>
                      </div>
                    )}
                    {report.tasksPlanned && (
                      <div>
                        <div style={styles.sectionLabel}>📅 Tasks Planned</div>
                        <div style={styles.sectionText}>{report.tasksPlanned}</div>
                      </div>
                    )}
                    {report.blockers && (
                      <div>
                        <div style={{ ...styles.sectionLabel, color: '#dc2626' }}>🚧 Blockers</div>
                        <div style={styles.sectionText}>{report.blockers}</div>
                      </div>
                    )}
                    {(report.hoursWorked != null || report.notes) && (
                      <div style={{ display: 'flex', gap: 24, marginTop: 4, flexWrap: 'wrap' }}>
                        {report.hoursWorked != null && report.hoursWorked > 0 && (
                          <div>
                            <div style={styles.sectionLabel}>⏱ Hours Worked</div>
                            <div style={styles.sectionText}>{report.hoursWorked}h</div>
                          </div>
                        )}
                        {report.notes && (
                          <div>
                            <div style={styles.sectionLabel}>📝 Notes</div>
                            <div style={styles.sectionText}>{report.notes}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

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
  page: { maxWidth: '100%', margin: '0 auto', padding: '36px 24px 64px', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column', gap: 24 },
  loadingShell: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' },
  spinner: { width: 40, height: 40, border: '4px solid #e2e8f0', borderTop: '4px solid #3b82f6', borderRadius: '50%' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 },
  kicker: { textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 11, color: '#94a3b8', fontWeight: 600, marginBottom: 6 },
  title: { margin: '0 0 6px', fontSize: 36, fontWeight: 800, color: '#0f172a' },
  subtitle: { margin: 0, color: '#64748b', fontSize: 15 },
  filtersBar: { display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: '18px 22px', boxShadow: '0 2px 12px rgba(15,23,42,0.04)' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: 4 },
  filterLabel: { fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' },
  filterInput: { border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '8px 12px', fontSize: 13, color: '#0f172a', background: '#f8fafc', outline: 'none', minWidth: 140 },
  applyBtn: { padding: '9px 20px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', alignSelf: 'flex-end' },
  card: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '22px 24px', boxShadow: '0 4px 16px rgba(15,23,42,0.05)' },
  sectionTitle: { margin: '0 0 16px', fontSize: 18, fontWeight: 700, color: '#0f172a' },
  reportList: { display: 'flex', flexDirection: 'column', gap: 8 },
  reportItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, background: '#f8fafc', flexWrap: 'wrap' },
  reportLeft: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  reportRight: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  projectTag: { background: '#eff6ff', color: '#1d4ed8', borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 700 },
  blockerTag: { background: '#fef2f2', color: '#dc2626', borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 700 },
  empty: { color: '#64748b', padding: '16px 0', textAlign: 'center' },
  sectionLabel: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: 4 },
  sectionText: { fontSize: 13, color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' },
};

export default TeamReports;
