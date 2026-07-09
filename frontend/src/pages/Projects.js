import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { toastSuccess, toastError, alertError, confirmDialog } from '../utils/swal';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', assignedMemberIds: [] });
  const [teamMembers, setTeamMembers] = useState([]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const [projRes, membersRes] = await Promise.all([
        api.get('/projects'),
        api.get('/dashboard/team-members')
      ]);
      setProjects(projRes.data);
      setTeamMembers(membersRes.data);
    } catch (err) {
      toastError('Could not load projects or members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/projects/${editingId}`, formData);
        toastSuccess('Project updated successfully!');
        setEditingId(null);
      } else {
        await api.post('/projects', formData);
        toastSuccess('Project created successfully!');
      }
      setFormData({ name: '', description: '', assignedMemberIds: [] });
      fetchProjects();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save project.';
      alertError('Save Failed', msg);
    }
  };

  const handleEdit = (project) => {
    setEditingId(project.id);
    setFormData({ 
      name: project.name, 
      description: project.description || '',
      assignedMemberIds: project.assignedMembers ? project.assignedMembers.map(m => m.id) : []
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', assignedMemberIds: [] });
  };

  const handleDelete = async (id, name) => {
    const confirmed = await confirmDialog({
      title: 'Delete Project?',
      text: `"${name}" will be permanently removed. Reports linked to it will lose their project tag.`,
      confirmText: 'Yes, delete it',
    });
    if (!confirmed) return;
    try {
      await api.delete(`/projects/${id}`);
      toastSuccess('Project deleted.');
      fetchProjects();
    } catch (err) {
      alertError('Delete Failed', err.response?.data?.message || 'Failed to delete project.');
    }
  };

  if (loading) return <div style={styles.loading}>Loading projects…</div>;

  return (
    <div style={styles.container} className="page-container">
      <div style={styles.headerRow}>
        <div>
          <div style={styles.kicker}>Manager</div>
          <h1 style={styles.heading}>Manage Projects</h1>
          <p style={styles.subheading}>Create, edit, or delete project categories used in reports.</p>
        </div>
      </div>

      {/* Form */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>{editingId ? '✏️ Edit Project' : '＋ Add New Project'}</h3>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Project Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="e.g. Client A, Internal Tooling, R&D"
              id="project-name-input"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Description (optional)</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={styles.input}
              placeholder="Brief description"
              id="project-description-input"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Assign Team Members</label>
            <div style={styles.checkboxList}>
              {teamMembers.map(m => (
                <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151' }}>
                  <input
                    type="checkbox"
                    checked={formData.assignedMemberIds.includes(m.id)}
                    onChange={(e) => {
                      const id = m.id;
                      if (e.target.checked) {
                        setFormData({ ...formData, assignedMemberIds: [...formData.assignedMemberIds, id] });
                      } else {
                        setFormData({ ...formData, assignedMemberIds: formData.assignedMemberIds.filter(i => i !== id) });
                      }
                    }}
                  />
                  {m.name}
                </label>
              ))}
            </div>
          </div>
          <div style={styles.buttonGroup}>
            <button type="submit" style={styles.submitButton} id="project-submit-btn">
              {editingId ? 'Update Project' : 'Create Project'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancelEdit} style={styles.cancelButton} id="project-cancel-btn">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List */}
      <div style={styles.listContainer}>
        <h3 style={styles.sectionTitle}>Existing Projects ({projects.length})</h3>
        {projects.length === 0 ? (
          <div style={styles.empty}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📂</div>
            <p>No projects yet. Create your first one above.</p>
          </div>
        ) : (
          <div style={styles.projectGrid}>
            {projects.map((project) => (
              <div key={project.id} style={styles.projectCard}>
                <div style={styles.projectInfo}>
                  <strong style={styles.projectName}>{project.name}</strong>
                  {project.description && (
                    <span style={styles.projectDesc}>{project.description}</span>
                  )}
                  {project.assignedMembers && project.assignedMembers.length > 0 && (
                    <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
                      <strong>Assigned:</strong> {project.assignedMembers.map(m => m.name).join(', ')}
                    </div>
                  )}
                </div>
                <div style={styles.actions}>
                  <button
                    onClick={() => handleEdit(project)}
                    style={styles.editButton}
                    id={`edit-project-${project.id}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id, project.name)}
                    style={styles.deleteButton}
                    id={`delete-project-${project.id}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '36px 24px 64px',
    maxWidth: '100%',
    margin: '0 auto',
    fontFamily: "'Inter', sans-serif",
  },
  headerRow: {
    marginBottom: 28,
  },
  kicker: {
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: 600,
    marginBottom: 6,
  },
  heading: {
    fontSize: '32px',
    fontWeight: 800,
    margin: '0 0 6px',
    color: '#0f172a',
  },
  subheading: {
    color: '#64748b',
    margin: 0,
    fontSize: 15,
  },
  card: {
    background: '#fff',
    padding: '24px',
    borderRadius: '18px',
    marginBottom: '28px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 16px rgba(15,23,42,0.05)',
  },
  cardTitle: {
    margin: '0 0 16px',
    fontSize: 16,
    fontWeight: 700,
    color: '#0f172a',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
  },
  input: {
    padding: '10px 14px',
    borderRadius: '12px',
    border: '1.5px solid #cbd5e1',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'inherit',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '4px',
  },
  submitButton: {
    padding: '10px 22px',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 700,
    boxShadow: '0 4px 12px rgba(59,130,246,0.35)',
  },
  cancelButton: {
    padding: '10px 22px',
    background: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 700,
  },
  listContainer: { marginTop: '8px' },
  sectionTitle: {
    margin: '0 0 16px',
    fontSize: 18,
    fontWeight: 700,
    color: '#0f172a',
  },
  projectGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  projectCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 18px',
    borderRadius: '14px',
    background: '#fff',
    border: '1px solid #e2e8f0',
    gap: 12,
    flexWrap: 'wrap',
  },
  projectInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  projectName: {
    fontSize: '15px',
    color: '#0f172a',
  },
  projectDesc: {
    color: '#64748b',
    fontSize: '13px',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    flexShrink: 0,
  },
  editButton: {
    padding: '6px 14px',
    background: '#fef9c3',
    color: '#a16207',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 700,
  },
  deleteButton: {
    padding: '6px 14px',
    background: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 700,
  },
  empty: {
    textAlign: 'center',
    padding: '48px 24px',
    color: '#64748b',
    background: '#f8fafc',
    borderRadius: '16px',
    border: '2px dashed #e2e8f0',
  },
  loading: {
    textAlign: 'center',
    padding: '80px',
    fontSize: '18px',
    color: '#64748b',
  },
};

export default Projects;