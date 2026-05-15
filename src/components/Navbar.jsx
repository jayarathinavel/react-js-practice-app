import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper function to check if link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/">
          <span className="brand-icon">⚛️</span> React Practice App
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">

            <li className="nav-item">
              <Link
                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                to="/dashboard"
              >
                <span className="nav-icon">📊</span>
                <span className="nav-text">Dashboard</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className={`nav-link ${isActive('/task-manager') ? 'active' : ''}`}
                to="/task-manager"
              >
                <span className="nav-icon">📋</span>
                <span className="nav-text">Task Manager</span>
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className={`nav-link ${isActive('/work-log') ? 'active' : ''}`}
                to="/work-log"
              >
                <span className="nav-icon">📅</span>
                <span className="nav-text">Work Log</span>
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center user-section">
            {user ? (
              <>
                <span className="user-greeting me-3 text-white">
                  <span className="user-icon">👋</span> {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline-light btn-sm logout-btn"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-outline-light btn-sm">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
