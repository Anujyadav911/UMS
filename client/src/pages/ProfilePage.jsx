import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { axiosPrivate } from '../api/axios';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    setLoading(true);
    try {
      const payload = { name: formData.name, email: formData.email };
      if (formData.password) {
        payload.password = formData.password;
      }

      const userId = user._id || user.id;
      const { data } = await axiosPrivate.put(`/users/${userId}`, payload);
      updateUser(data.data);
      toast.success('Profile updated successfully');
      setFormData({ ...formData, password: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="mb-2">My Profile</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your personal information and security settings.</p>
      </div>

      <div className="glass-panel" style={{ flex: 1, padding: '2.5rem', display: 'flex', gap: '3rem', alignItems: 'stretch' }}>
        
        {/* Left Side: Avatar & Details */}
        <div style={{ flex: '0 0 280px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2.5rem 1.5rem', background: 'var(--bg-dark)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
          <div className="avatar" style={{ width: '110px', height: '110px', fontSize: '3rem', margin: '0 auto 1.5rem auto', boxShadow: '0 8px 16px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.1)' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h2 style={{ marginBottom: '0.25rem', color: 'var(--text-primary)', fontSize: '1.4rem' }}>{user?.name}</h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', wordBreak: 'break-all' }}>{user?.email}</p>
          <span className={`badge badge-${user?.role}`}>{user?.role}</span>
        </div>

        {/* Right Side: Forms */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            <h3 className="mb-4">Personal Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Full Name</label>
                <input type="text" name="name" className="input-field" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Email Address</label>
                <input type="email" name="email" className="input-field" value={formData.email} onChange={handleChange} required />
              </div>
            </div>

            <h3 className="mb-4" style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
              Security Center
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Leave blank if you don't want to change your password.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">New Password</label>
                <input type="password" name="password" className="input-field" value={formData.password} onChange={handleChange} minLength="6" placeholder="Leave blank to keep unchanged" />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Confirm New Password</label>
                <input type="password" name="confirmPassword" className="input-field" value={formData.confirmPassword} onChange={handleChange} minLength="6" placeholder="••••••••" />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto', paddingTop: '2rem' }}>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '180px' }}>
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
