import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import { useParams, useNavigate } from 'react-router-dom';

const ReportForm = () => {
  const { id } = useParams(); // edit mode if id exists
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    // fetch projects
    api.get('/projects').then(res => setProjects(res.data));
    if (id) {
      api.get(`/reports/${id}`).then(res => {
        const data = res.data;
        setValue('weekStartDate', data.weekStartDate);
        setValue('weekEndDate', data.weekEndDate);
        setValue('projectId', data.projectId || '');
        setValue('tasksCompleted', data.tasksCompleted);
        setValue('tasksPlanned', data.tasksPlanned);
        setValue('blockers', data.blockers);
        setValue('hoursWorked', data.hoursWorked);
        setValue('notes', data.notes);
        setValue('status', data.status);
      });
    }
  }, [id, setValue]);

  const onSubmit = async (data) => {
    try {
      if (id) {
        await api.put(`/reports/${id}`, data);
      } else {
        await api.post('/reports', data);
      }
      navigate('/my-reports');
    } catch (err) {
      alert('Error saving report');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('weekStartDate')} type="date" required />
      <input {...register('weekEndDate')} type="date" required />
      <select {...register('projectId')}>
        <option value="">Select Project</option>
        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <textarea {...register('tasksCompleted')} placeholder="Tasks Completed" />
      <textarea {...register('tasksPlanned')} placeholder="Tasks Planned" />
      <textarea {...register('blockers')} placeholder="Blockers" />
      <input {...register('hoursWorked')} type="number" step="0.1" placeholder="Hours Worked" />
      <textarea {...register('notes')} placeholder="Notes" />
      <select {...register('status')}>
        <option value="DRAFT">Draft</option>
        <option value="SUBMITTED">Submit</option>
      </select>
      <button type="submit">{id ? 'Update' : 'Create'}</button>
    </form>
  );
};

export default ReportForm;