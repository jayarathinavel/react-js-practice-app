import { useEffect, useState, useContext } from 'react';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import DashboardHelp from '../components/dashboard/DashboardHelp';
import ReactMarkdown from "react-markdown"
import { apiCache, CACHE_KEYS } from '../utils/apiCache';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [yesterdayLog, setYesterdayLog] = useState(null);
  const [todayLog, setTodayLog] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (forceRefresh = false) => {
    // Check cache first if not forcing refresh
    if (!forceRefresh && apiCache.has(CACHE_KEYS.DASHBOARD)) {
      const cachedData = apiCache.get(CACHE_KEYS.DASHBOARD);
      setTasks(cachedData.tasks);
      setYesterdayLog(cachedData.yesterdayLog);
      setTodayLog(cachedData.todayLog);
      setLoading(false);
      return;
    }

    setLoading(!forceRefresh);
    setRefreshing(forceRefresh);
    try {
      const [tasksRes, worklogsRes] = await Promise.all([
        api.get('/task-manager'),
        api.get('/work-log')
      ]);
      
      // Filter non-completed and non-cancelled tasks
      const filteredTasks = tasksRes.data.filter(task => task.status !== 'completed' && task.status !== 'cancelled');
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // Sort all logs by date (most recent first)
      const allLogs = worklogsRes.data.sort((a, b) =>
        new Date(b.date) - new Date(a.date)
      );
      
      // Find today's work log
      const todayWorklog = allLogs.find(log => {
        const logDate = new Date(log.date).toISOString().split('T')[0];
        return logDate === todayStr;
      });
      
      // Find the most recent work log before today (last working day)
      // This handles weekends and holidays automatically
      const previousWorklog = allLogs.find(log => {
        const logDate = new Date(log.date).toISOString().split('T')[0];
        return logDate < todayStr;
      });
      
      setTasks(filteredTasks);
      setYesterdayLog(previousWorklog);
      setTodayLog(todayWorklog);

      // Store in cache
      apiCache.set(CACHE_KEYS.DASHBOARD, {
        tasks: filteredTasks,
        yesterdayLog: previousWorklog,
        todayLog: todayWorklog
      });
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchData(true);
  };

  return (
    <div className="bg-light min-vh-100">
      <Navbar />

      <div className="container py-4">

        {/* Header with Help Icon */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold mb-0">
            👋 Welcome, <span className="text-primary">{user?.name || 'User'}</span>
          </h2>
          <div>
            <button
              className="btn btn-sm btn-outline-secondary me-1"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh dashboard"
            >
              {refreshing ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                "🔄"
              )}
            </button>
            <DashboardHelp />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {/* Pending Tasks */}
            <div className="card mb-4 border-primary shadow-sm">
              <div className="card-body">
                <h4 className="card-title">
                  📝 Pending Tasks
                </h4>

                <ul className="list-group list-group-flush mt-3">
                  {tasks.length === 0 ? (
                    <li className="list-group-item text-muted text-center">
                      🎉 No pending tasks - Great job!
                    </li>
                  ) : (
                    tasks.map(t => (
                      <li key={t.id} className="list-group-item d-flex align-items-center">
                        <span className="me-2">
                          {t.status === 'in-progress' ? '🚧' : t.status === 'cancelled' ? '❌' : '⏳'}
                        </span>
                        <span className="flex-grow-1">{t.title}</span>
                        <span className={`badge ${
                          t.status === 'in-progress' ? 'bg-primary' :
                          t.status === 'cancelled' ? 'bg-danger' :
                          'bg-warning text-dark'
                        }`}>
                          {t.status === 'in-progress' ? 'In Progress' :
                           t.status === 'cancelled' ? 'Cancelled' :
                           'Pending'}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>

                        {/* Today's Plan */}
            <div className="card mb-4 border-warning shadow-sm">
              <div className="card-body">
                <h4 className="card-title">
                  🚀 What's Planned Today
                </h4>

                <div className="mt-3">
                  {!yesterdayLog && !todayLog ? (
                    <p className="text-muted text-center">
                      📭 No work logs available
                    </p>
                  ) : (
                    <>
                      {/* Today's Todo */}
                      {todayLog && todayLog.todo && (
                        <div className="border-start border-primary border-3 ps-3 mb-3 bg-white p-3 rounded">
                          <small className="text-muted d-block mb-2">
                            📅 Today's Plan ({new Date(todayLog.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })})
                          </small>
                          <ReactMarkdown>{todayLog.todo}</ReactMarkdown>
                        </div>
                      )}

                      {/* Previous Working Day's Todo (carried over) */}
                      {yesterdayLog && yesterdayLog.todo && (
                        <div className="border-start border-warning border-3 ps-3 mb-3 bg-white p-3 rounded">
                          <small className="text-muted d-block mb-2">
                            📅 Carried Over from {new Date(yesterdayLog.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                            {(() => {
                              const daysDiff = Math.floor((new Date() - new Date(yesterdayLog.date)) / (1000 * 60 * 60 * 24));
                              if (daysDiff === 1) return ' (Yesterday)';
                              if (daysDiff === 3 && new Date().getDay() === 1) return ' (Last Friday)';
                              if (daysDiff > 1) return ` (${daysDiff} days ago)`;
                              return '';
                            })()}
                          </small>
                          <ReactMarkdown>{yesterdayLog.todo}</ReactMarkdown>
                        </div>
                      )}
                      
                      {/* If no todos in either */}
                      {(!yesterdayLog?.todo && !todayLog?.todo) && (
                        <p className="text-muted text-center">
                          📝 No tasks planned yet
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Last Working Day's Work */}
            <div className="card mb-4 border-success shadow-sm">
              <div className="card-body">
                <h4 className="card-title">
                  ✅ What Was Done Yesterday
                </h4>

                <div className="mt-3">
                  {!yesterdayLog ? (
                    <p className="text-muted text-center">
                      📭 No previous work log available
                    </p>
                  ) : (
                    <div className="border-start border-success border-3 ps-3 mb-3 bg-white p-3 rounded">
                      <small className="text-muted d-block mb-2">
                        📅 {new Date(yesterdayLog.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                        {(() => {
                          const daysDiff = Math.floor((new Date() - new Date(yesterdayLog.date)) / (1000 * 60 * 60 * 24));
                          if (daysDiff === 1) return ' (Yesterday)';
                          if (daysDiff === 3 && new Date().getDay() === 1) return ' (Last Friday)';
                          if (daysDiff > 1) return ` (${daysDiff} days ago)`;
                          return '';
                        })()}
                      </small>
                      <ReactMarkdown>{yesterdayLog.done || '_No tasks completed_'}</ReactMarkdown>
                    </div>
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
