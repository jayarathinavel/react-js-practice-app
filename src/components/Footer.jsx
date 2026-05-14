import { useState, useEffect } from 'react';
import axios from 'axios';
import './Footer.css';

export default function Footer() {
  const [healthStatus, setHealthStatus] = useState('loading');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await axios.get(import.meta.env.VITE_API_URL, {
          timeout: 100000,
        });
        setHealthStatus(response.status === 200 ? 'ok' : 'error');
      } catch (error) {
        setHealthStatus('error');
      }
    };

    checkHealth();
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  const getHealthDisplay = () => {
    switch (healthStatus) {
      case 'loading':
        return 'API Health: ⏳ Loading...';
      case 'ok':
        return 'API Health: ✅';
      case 'error':
        return 'API Health: ❌';
      default:
        return 'API Health: ❓';
    }
  };

  return (
    <footer className="app-footer">
      <div className="health-check">{getHealthDisplay()}</div>
    </footer>
  );
}

// Made with Bob
