// src/pages/Projects.js
import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  // Fetch all projects
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
      alert('Could not load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Create or update project
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update
        await api.put(`/projects/${editingId}`, formData);
        setEditingId(null);
      } else {
        // Create
        await api.post('/projects', formData);
      }
      setFormData({ name: '', description: '' });
      fetchProjects(); // refresh list
    } catch (err) {
      console.error('Error saving project:', err);
      alert('Failed to save project.');
    }
  };

  // Start editing a project
  const handleEdit = (project) => {
    setEditingId(project.id);
    setFormData({ name: project.name, description: project.description || '' });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', description: '' });
  };

  // Delete a project
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Failed to delete project.');
    }
  };

  if (loading) return <div style={styles.loading}>Loading projects...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Manage Projects</h1>
      <p style={styles.subheading}>Create, edit, or delete project categories used in reports.</p>

      {/* Project form (create / edit) */}
      <div style={styles.card}>
        <h3>{editingId ? 'Edit Project' : 'Add New Project'}</h3>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label>Project Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="e.g. Client A, Internal Tooling"
            />
          </div>
          <div style={styles.field}>
            <label>Description (optional)</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              style={styles.input}
              placeholder="Brief description"
            />
          </div>
          <div style={styles.buttonGroup}>
            <button type="submit" style={styles.submitButton}>
              {editingId ? 'Update Project' : 'Create Project'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancelEdit} style={styles.cancelButton}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Project list */}
      <div style={styles.listContainer}>
        <h3>Existing Projects</h3>
        {projects.length === 0 ? (
          <p style={styles.emptyMessage}>No projects created yet.</p>
        ) : (
          <ul style={styles.list}>
            {projects.map((project) => (
              <li key={project.id} style={styles.listItem}>
                <div style={styles.projectInfo}>
                  <strong style={styles.projectName}>{project.name}</strong>
                  {project.description && (
                    <span style={styles.projectDesc}> – {project.description}</span>
                  )}
                </div>
                <div style={styles.actions}>
                  <button
                    onClick={() => handleEdit(project)}
                    style={styles.editButton}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    style={styles.deleteButton}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

// Inline styles – adapt to your design system
const styles = {
  container: {
    padding: '24px',
    maxWidth: '800px',
    margin: '0 auto',
  },
  heading: {
    fontSize: '28px',
    marginBottom: '4px',
  },
  subheading: {
    color: '#666',
    marginBottom: '24px',
  },
  card: {
    background: '#f9fafb',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '32px',
    border: '1px solid #e5e7eb',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  input: {
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  submitButton: {
    padding: '8px 20px',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  cancelButton: {
    padding: '8px 20px',
    background: '#9ca3af',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  listContainer: {
    marginTop: '16px',
  },
  list: {
    listStyle: 'none',
    padding: 0,
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #e5e7eb',
  },
  projectInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  projectName: {
    fontSize: '16px',
  },
  projectDesc: {
    color: '#6b7280',
    fontSize: '14px',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  editButton: {
    padding: '4px 12px',
    background: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  deleteButton: {
    padding: '4px 12px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  emptyMessage: {
    color: '#6b7280',
    fontStyle: 'italic',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '18px',
    color: '#6b7280',
  },
};

export default Projects;