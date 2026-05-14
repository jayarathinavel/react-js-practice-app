import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { useApiNavigate } from './hooks/useApiNavigate';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import TaskManger from './pages/task-manager/TaskManger';
import WorkLog from './pages/work-log/WorkLog';
import Footer from './components/Footer';

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <p>Loading...</p>; // temporary splash while restoring user
  return user ? children : <Navigate to="/login" replace />;
}

function AppContent() {
  useApiNavigate()

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="task-manager" element={<TaskManger />} />
      <Route path="work-log" element={<WorkLog />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
      <Footer />
    </BrowserRouter>
  )
}
