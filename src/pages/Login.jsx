import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../api/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const errorMessage = location.state?.error;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', textAlign: 'center' }}>
      <h2>Login</h2>
      {errorMessage && (
        <div
          style={{
            padding: '10px',
            marginBottom: '15px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
          }}
        >
          {errorMessage}
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
      </form>
      <p style={{ marginTop: '20px' }}>
        Don't have an account?{' '}
        <Link to="/signup" style={{ color: '#007bff', textDecoration: 'none' }}>
          Sign up here
        </Link>
      </p>
    </div>
  );
}
