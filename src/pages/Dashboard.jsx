import { useEffect, useState, useContext } from 'react';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import ReactMarkdown from "react-markdown"

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [worklogs, setWorklogs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/task-manager')
      .then(res => setTasks(res.data.filter(task => task.status !== 'completed')))
      .catch(err => setError(err.response?.data?.message || 'Failed to fetch tasks'));

    api.
      get('/work-log')
      // Fetch the recent work log
      .then(res => setWorklogs(res.data.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-1)))
      .catch(err => setError(err.response?.data?.message || 'Failed to fetch work logs'));
  }, []);

  return (
    <div className="bg-light min-vh-100">
      <Navbar />

      <div className="container py-4">

        {/* Header */}
        <h2 className="mb-4 fw-bold">
          👋 Welcome, <span className="text-primary">{user?.name || 'User'}</span>
        </h2>

        {/* Pending Tasks */}
        <div className="card mb-4 border-primary">
          <div className="card-body">
            <h4 className="card-title">
              📝 Pending Tasks
            </h4>

            {error && <p className="text-danger mt-2">{error}</p>}

            <ul className="list-group list-group-flush mt-3">
              {tasks.map(t => (
                <li key={t.id} className="list-group-item">
                  🔹 {t.title}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Yesterday Work */}
        <div className="card mb-4 border-success">
          <div className="card-body">
            <h4 className="card-title">
              ✅ What Was Done Yesterday
            </h4>

            <div className="mt-3">
              {worklogs.map((wl, i) => (
                <div key={i} className="border-start border-success ps-3 mb-3 bg-light rounded">
                  <ReactMarkdown>{wl.done}</ReactMarkdown>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Today's Plan */}
        <div className="card mb-4 border-warning">
          <div className="card-body">
            <h4 className="card-title">
              🚀 What's Planned Today
            </h4>

            <div className="mt-3">
              {worklogs.map((wl, i) => (
                <div key={i} className="border-start border-warning ps-3 mb-3 bg-light rounded">
                  <ReactMarkdown>{wl.todo}</ReactMarkdown>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
