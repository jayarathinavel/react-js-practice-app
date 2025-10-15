import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px 10px',
        backgroundColor: '#282c34',
        color: 'white',
      }}
    >
      <h3>React Practice App</h3>
      <div>
        {user ? (
          <>
            <span style={{ marginRight: '15px' }}>👋 {user.name}</span>
            <button onClick={handleLogout} style={{ padding: '6px 12px' }}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" style={{ color: 'white' }}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
