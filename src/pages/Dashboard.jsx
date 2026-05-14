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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tasksRes, worklogsRes] = await Promise.all([
          api.get('/task-manager'),
          api.get('/work-log')
        ]);
        setTasks(tasksRes.data.filter(task => task.status !== 'completed'));
        setWorklogs(worklogsRes.data.sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-1));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-light min-vh-100">
      <Navbar />

      <div className="container py-4">

        {/* Header */}
        <h2 className="mb-4 fw-bold">
          👋 Welcome, <span className="text-primary">{user?.name || 'User'}</span>
        </h2>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Pending Tasks */}
            <div className="card mb-4 border-primary">
              <div className="card-body">
                <h4 className="card-title">
                  📝 Pending Tasks
                </h4>

                {error && <p className="text-danger mt-2">{error}</p>}

                <ul className="list-group list-group-flush mt-3">
                  {tasks.length === 0 ? (
                    <li className="list-group-item text-muted text-center">No pending tasks</li>
                  ) : (
                    tasks.map(t => (
                      <li key={t.id} className="list-group-item">
                        🔹 {t.title}
                      </li>
                    ))
                  )}
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
                  {worklogs.length === 0 ? (
                    <p className="text-muted text-center">No work logs available</p>
                  ) : (
                    worklogs.map((wl, i) => (
                      <div key={i} className="border-start border-success ps-3 mb-3 bg-light rounded">
                        <ReactMarkdown>{wl.done}</ReactMarkdown>
                      </div>
                    ))
                  )}
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
                  {worklogs.length === 0 ? (
                    <p className="text-muted text-center">No work logs available</p>
                  ) : (
                    worklogs.map((wl, i) => (
                      <div key={i} className="border-start border-warning ps-3 mb-3 bg-light rounded">
                        <ReactMarkdown>{wl.todo}</ReactMarkdown>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
