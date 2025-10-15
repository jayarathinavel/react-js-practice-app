import { useEffect, useState, useContext } from 'react';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/tasks')
      .then(res => setTasks(res.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to fetch tasks'));
  }, []);

  return (
    <div>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <h2>Welcome, {user?.name || 'User'}</h2>
        <h3>My Tasks</h3>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <ul>
          {tasks.map(t => (
            <li key={t.id}>{t.title}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
