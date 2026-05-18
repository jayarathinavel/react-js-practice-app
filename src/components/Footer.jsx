import { useState, useEffect } from 'react';
import axios from 'axios';
import './Footer.css';

export default function Footer() {
  const [healthStatus, setHealthStatus] = useState('loading');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showPopover, setShowPopover] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await axios.get(import.meta.env.VITE_API_URL, {
          timeout: 100000,
        });
        setHealthStatus(response.status === 200 ? 'ok' : 'error');
        setLastUpdated(new Date());
      } catch (error) {
        setHealthStatus('error');
        setLastUpdated(new Date());
      }
    };

    checkHealth();
    // Check health every 2 minutes (120000ms)
    const interval = setInterval(checkHealth, 120000);

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

  const formatDateTime = (date) => {
    if (!date) return 'Not yet updated';
    
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    
    return date.toLocaleString('en-US', options);
  };

  return (
    <footer className="app-footer">
      <div
        className="health-check"
        onMouseEnter={() => setShowPopover(true)}
        onMouseLeave={() => setShowPopover(false)}
      >
        {getHealthDisplay()}
        {showPopover && (
          <div className="health-popover">
            <div className="popover-title">Last Updated</div>
            <div className="popover-time">{formatDateTime(lastUpdated)}</div>
            <div className="popover-info">Refreshes every 2 minutes</div>
          </div>
        )}
      </div>
    </footer>
  );
}

// Made with Bob
