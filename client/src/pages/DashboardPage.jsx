import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, UserCheck, ShieldCheck, Clock } from 'lucide-react';

const StatCard = ({ title, value, icon, color }) => (
  <div className="glass-panel glass-panel-hover" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: `1px solid color-mix(in srgb, ${color} 20%, transparent)` }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}
      </p>
      <div style={{ 
        width: '38px', height: '38px', borderRadius: '10px', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `color-mix(in srgb, ${color} 10%, transparent)`,
        color: color,
        boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color} 20%, transparent)`
      }}>
        {icon}
      </div>
    </div>
    <div>
      <h3 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</h3>
    </div>
  </div>
);

const DashboardPage = () => {
  const { user, isAdmin, isManager } = useAuth();

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Welcome back, {user?.name}</h1>
        <p>Here's what's happening with your account today.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard title="Account Status" value={user?.status?.toUpperCase()} icon={<UserCheck size={24} />} color="var(--accent-success)" />
        <StatCard title="Your Role" value={user?.role?.toUpperCase()} icon={<ShieldCheck size={24} />} color="var(--primary)" />
        <StatCard title="Member Since" value={new Date(user?.createdAt || Date.now()).toLocaleDateString()} icon={<Clock size={24} />} color="var(--secondary)" />
        {(isAdmin || isManager) && (
          <StatCard title="Total Users" value="Manage" icon={<Users size={24} />} color="var(--accent-warning)" />
        )}
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
          <ShieldCheck size={20} className="text-muted" style={{ color: 'var(--primary)' }} />
          Access Level: <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{user?.role?.toUpperCase()}</span>
        </h3>
        <p style={{ marginBottom: '1.5rem' }}>
          {isAdmin && "You have full administrative privileges. You can manage all users, assign roles, and configure system settings."}
          {isManager && "You have manager privileges. You can view all users and edit details of non-admin accounts."}
          {!isAdmin && !isManager && "You have a standard user account. You can view and manage your own personal profile."}
        </p>
        
        <div style={{ padding: '1.25rem', background: 'var(--bg-dark)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
          <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Capabilities</h4>
          <ul style={{ paddingLeft: '0', listStyle: 'none', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--primary)' }}>✦</span> Read access to personal profile</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--primary)' }}>✦</span> Write access to own profile details (Name, Password)</li>
            {(isAdmin || isManager) && <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--primary)' }}>✦</span> Read access to user directory</li>}
            {(isAdmin || isManager) && <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--primary)' }}>✦</span> Write access to user statuses (Limited)</li>}
            {isAdmin && <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--primary)' }}>✦</span> Full CRUD capabilities over user repository</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
