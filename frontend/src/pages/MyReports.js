import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/my')
      .then(res => setReports(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>My Reports</h1>
      <Link to="/reports/new"><button>Create New Report</button></Link>
      <ul>
        {reports.map(r => (
          <li key={r.id}>
            Week: {r.weekStartDate} - {r.weekEndDate} | Status: {r.status}
            <Link to={`/reports/${r.id}/edit`}>Edit</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MyReports;