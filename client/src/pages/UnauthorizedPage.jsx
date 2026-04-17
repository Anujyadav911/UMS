import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem', textAlign: 'center' }}>
      <div className="glass-panel" style={{ padding: '3rem', maxWidth: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ 
          width: '80px', height: '80px', borderRadius: '50%', 
          background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--accent-danger)', marginBottom: '1.5rem'
        }}>
          <ShieldAlert size={40} />
        </div>
        <h1 style={{ marginBottom: '1rem' }}>Access Denied</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          You do not have the required permissions to access this page. Please contact your administrator if you believe this is a mistake.
        </p>
        <Link to="/dashboard" className="btn btn-primary">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
