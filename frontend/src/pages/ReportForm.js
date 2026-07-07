import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import { useParams, useNavigate } from 'react-router-dom';

const ReportForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    api.get('/projects').then(res => setProjects(res.data)).catch(() => {});
    if (id) {
      api.get(`/reports/${id}`).then(res => {
        const data = res.data;
        setValue('weekStartDate', data.weekStartDate);
        setValue('weekEndDate', data.weekEndDate);
        setValue('projectId', data.projectId || '');
        setValue('tasksCompleted', data.tasksCompleted);
        setValue('tasksPlanned', data.tasksPlanned);
        setValue('blockers', data.blockers || '');
        setValue('hoursWorked', data.hoursWorked);
        setValue('notes', data.notes || '');
        setValue('status', data.status || 'DRAFT');
      }).catch(() => setError('Could not load report data.'));
    }
  }, [id, setValue]);

  const onSubmit = async (data) => {
    setSaving(true);
    setError('');
    try {
      if (id) {
        await api.put(`/reports/${id}`, data);
      } else {
        await api.post('/reports', data);
      }
      navigate('/my-reports');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving report. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.shell}>
      <div style={styles.container}>
        {/* Page header */}
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => navigate('/my-reports')} type="button" id="back-btn">
            ← Back
          </button>
          <div>
            <div style={styles.kicker}>{id ? 'Editing report' : 'New report'}</div>
            <h1 style={styles.title}>{id ? 'Update Weekly Report' : 'Create Weekly Report'}</h1>
            <p style={styles.subtitle}>Fill in the fixed fields below. All reports follow the same structure.</p>
          </div>
        </div>

        {error && <div style={styles.errorBanner}>{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
          {/* Week range */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>📅 Date Range</h3>
            <div style={styles.row}>
              <Field label="Week Start Date *" error={errors.weekStartDate?.message}>
                <input
                  {...register('weekStartDate', { required: 'Required' })}
                  type="date"
                  style={fieldStyle(!!errors.weekStartDate)}
                  id="weekStartDate"
                />
              </Field>
              <Field label="Week End Date *" error={errors.weekEndDate?.message}>
                <input
                  {...register('weekEndDate', { required: 'Required' })}
                  type="date"
                  style={fieldStyle(!!errors.weekEndDate)}
                  id="weekEndDate"
                />
              </Field>
            </div>
          </div>

          {/* Project */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🏷 Project / Category</h3>
            <Field label="Project">
              <select {...register('projectId')} style={fieldStyle(false)} id="projectId">
                <option value="">No project selected</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Work details */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>💼 Work Details</h3>
            <Field label="Tasks Completed *" error={errors.tasksCompleted?.message}>
              <textarea
                {...register('tasksCompleted', { required: 'Required' })}
                placeholder="Describe what you completed this week…"
                rows={4}
                style={{ ...fieldStyle(!!errors.tasksCompleted), resize: 'vertical' }}
                id="tasksCompleted"
              />
            </Field>
            <Field label="Tasks Planned for Next Week *" error={errors.tasksPlanned?.message}>
              <textarea
                {...register('tasksPlanned', { required: 'Required' })}
                placeholder="What are you planning to work on next week?…"
                rows={4}
                style={{ ...fieldStyle(!!errors.tasksPlanned), resize: 'vertical' }}
                id="tasksPlanned"
              />
            </Field>
          </div>

          {/* Blockers & extra */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🚧 Blockers & Notes</h3>
            <Field label="Blockers / Challenges">
              <textarea
                {...register('blockers')}
                placeholder="Any blockers or challenges you faced? Leave blank if none."
                rows={3}
                style={{ ...fieldStyle(false), resize: 'vertical' }}
                id="blockers"
              />
            </Field>
            <div style={styles.row}>
              <Field label="Hours Worked (optional)">
                <input
                  {...register('hoursWorked')}
                  type="number"
                  step="0.5"
                  min="0"
                  max="168"
                  placeholder="e.g. 40"
                  style={fieldStyle(false)}
                  id="hoursWorked"
                />
              </Field>
              <Field label="Status">
                <select {...register('status')} style={fieldStyle(false)} id="status">
                  <option value="DRAFT">Save as Draft</option>
                  <option value="SUBMITTED">Submit Report</option>
                </select>
              </Field>
            </div>
            <Field label="Notes / Links (optional)">
              <textarea
                {...register('notes')}
                placeholder="Any additional notes, links, or context…"
                rows={2}
                style={{ ...fieldStyle(false), resize: 'vertical' }}
                id="notes"
              />
            </Field>
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button type="button" style={styles.cancelBtn} onClick={() => navigate('/my-reports')} id="cancel-btn">
              Cancel
            </button>
            <button type="submit" style={styles.submitBtn} disabled={saving} id="submit-report-btn">
              {saving ? 'Saving…' : (id ? 'Update Report' : 'Create Report')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Field = ({ label, error, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
    <label style={styles.label}>{label}</label>
    {children}
    {error && <span style={{ color: '#dc2626', fontSize: 12 }}>{error}</span>}
  </div>
);

const fieldStyle = (hasError) => ({
  border: `1.5px solid ${hasError ? '#dc2626' : '#cbd5e1'}`,
  borderRadius: 12,
  padding: '11px 14px',
  fontSize: 14,
  outline: 'none',
  background: '#fff',
  color: '#0f172a',
  fontFamily: 'inherit',
  width: '100%',
  boxSizing: 'border-box',
});

const styles = {
  shell: {
    minHeight: '100vh',
    background: '#f8fafc',
    padding: '32px 16px 64px',
    fontFamily: "'Inter', sans-serif",
  },
  container: {
    maxWidth: 760,
    margin: '0 auto',
  },
  header: {
    marginBottom: 28,
  },
  backBtn: {
    border: 'none',
    background: 'none',
    color: '#3b82f6',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    padding: '0 0 12px',
  },
  kicker: {
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: 600,
    marginBottom: 6,
  },
  title: {
    margin: '0 0 6px',
    fontSize: 30,
    fontWeight: 800,
    color: '#0f172a',
  },
  subtitle: {
    margin: 0,
    color: '#64748b',
    fontSize: 14,
  },
  errorBanner: {
    background: '#fee2e2',
    color: '#b91c1c',
    padding: '12px 16px',
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 14,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  card: {
    background: '#fff',
    borderRadius: 18,
    border: '1px solid #e2e8f0',
    padding: '22px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    boxShadow: '0 2px 12px rgba(15,23,42,0.04)',
  },
  cardTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: '#0f172a',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
    paddingTop: 4,
  },
  cancelBtn: {
    padding: '12px 22px',
    background: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: 14,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
  },
  submitBtn: {
    padding: '12px 28px',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: '#fff',
    border: 'none',
    borderRadius: 14,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(59,130,246,0.4)',
  },
};

export default ReportForm;