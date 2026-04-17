import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';

const LoginPage = () => {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // use native controlled forms for simplicity since react-hook-form is a bit verbose for simple login
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    let success;
    
    if (isRegistering) {
      if (!formData.name) {
        alert('Name is required');
        setIsLoading(false);
        return;
      }
      success = await register(formData.name, formData.email, formData.password);
    } else {
      success = await login(formData.email, formData.password);
    }

    if (success) {
      navigate('/dashboard');
    }
    setIsLoading(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '3rem 2.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(59,130,246,0.1))', border: '1px solid rgba(99,102,241,0.2)', marginBottom: '1.5rem', fontSize: '1.75rem', color: 'var(--primary)', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}>
            ✦
          </div>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.6rem', fontWeight: 600 }}>
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Please enter your details to continue.</p>
        </div>

        <form onSubmit={onSubmit}>
          {isRegistering && (
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input 
                type="text" 
                name="name"
                className="input-field" 
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email</label>
            <input 
              type="email" 
              name="email"
              className="input-field" 
              placeholder="you@example.com"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input 
              type="password" 
              name="password"
              className="input-field" 
              placeholder="••••••••"
              required
              minLength="6"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isLoading}>
            {isLoading ? 'Processing...' : (isRegistering ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}
          </span>
          <button 
            type="button" 
            style={{ 
              background: 'none', border: 'none', color: 'var(--primary)', 
              fontWeight: 600, marginLeft: '0.5rem', cursor: 'pointer', fontFamily: 'inherit'
            }}
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
