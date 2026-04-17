import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { axiosPrivate } from '../api/axios';
import { Search, Plus, Filter, Edit2, Trash2, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const UsersPage = () => {
  const { isAdmin, isManager, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user', status: 'active' });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let query = `/users?page=${page}&limit=10`;
      if (search) query += `&search=${search}`;
      if (roleFilter) query += `&role=${roleFilter}`;
      if (statusFilter) query += `&status=${statusFilter}`;

      const { data } = await axiosPrivate.get(query);
      setUsers(data.data);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [page, search, roleFilter, statusFilter]);

  const handleOpenModal = (user = null) => {
    if (user) {
      // Check permissions
      if (isManager && user.role === 'admin') {
        return toast.error("Managers cannot edit admin users");
      }
      setEditingUser(user);
      setFormData({ 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        status: user.status,
        password: '' // Don't show existing password
      });
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'user', status: 'active' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password; // Don't send empty password
      
      if (editingUser) {
        await axiosPrivate.put(`/users/${editingUser._id}`, payload);
        toast.success('User updated successfully');
      } else {
        await axiosPrivate.post('/users', payload);
        toast.success('User created successfully');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDelete = async (id, role) => {
    if (role === 'admin' && currentUser._id !== id) {
      if (!window.confirm("Warning: You are about to deactivate another Admin. Continue?")) return;
    } else {
      if (!window.confirm("Are you sure you want to deactivate this user?")) return;
    }

    try {
      await axiosPrivate.delete(`/users/${id}`);
      toast.success('User deactivated successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex-between mb-6">
        <div>
          <h1>User Management</h1>
          <p>Manage roles, statuses, and account details in your organization.</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} /> New User
          </button>
        )}
      </div>

      <div className="glass-panel mb-6" style={{ padding: '0.75rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-dark)', border: '1px solid var(--border-light)', padding: '0.65rem 1rem', borderRadius: 'var(--radius-sm)' }}>
          <Search size={18} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search users..." 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', flex: 1, outline: 'none', fontSize: '0.9rem' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-dark)', border: '1px solid var(--border-light)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)' }}>
          <Filter size={16} className="text-muted" />
          <select 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '0.9rem', cursor: 'pointer' }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="" style={{color: 'black'}}>All Roles</option>
            <option value="admin" style={{color: 'black'}}>Admin</option>
            <option value="manager" style={{color: 'black'}}>Manager</option>
            <option value="user" style={{color: 'black'}}>User</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-dark)', border: '1px solid var(--border-light)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)' }}>
          <select 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '0.9rem', cursor: 'pointer' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="" style={{color: 'black'}}>All Statuses</option>
            <option value="active" style={{color: 'black'}}>Active</option>
            <option value="inactive" style={{color: 'black'}}>Inactive</option>
          </select>
        </div>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined Date</th>
              {(isAdmin || isManager) && <th style={{textAlign: 'right'}}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{textAlign: 'center', padding: '3rem'}}>Loading users...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="5" style={{textAlign: 'center', padding: '3rem'}}>No users found matching query.</td></tr>
            ) : (
              users.map(user => (
                <tr key={user._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{user.name} {currentUser._id === user._id && '(You)'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${user.role}`}>{user.role}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${user.status}`}>
                      <span className={`status-dot ${user.status}`}></span>
                      {user.status}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  {(isAdmin || isManager) && (
                    <td style={{textAlign: 'right'}}>
                      <button 
                        onClick={() => handleOpenModal(user)} 
                        style={{background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', cursor: 'pointer', margin: '0 0.25rem', padding: '0.5rem', borderRadius: 'var(--radius-sm)', transition: 'var(--transition-fast)'}}
                        title="Edit User"
                        disabled={isManager && user.role === 'admin'}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-light)'}
                      >
                        <Edit2 size={16} />
                      </button>
                      
                      {isAdmin && (
                        <button 
                          onClick={() => handleDelete(user._id, user.role)}
                          style={{background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', color: 'var(--accent-danger)', cursor: 'pointer', margin: '0 0.25rem', padding: '0.5rem', borderRadius: 'var(--radius-sm)', opacity: user.status === 'inactive' ? 0.5 : 1, transition: 'var(--transition-fast)'}}
                          title="Deactivate User"
                          disabled={user.status === 'inactive'}
                          onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-danger)'}
                          onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-light)'}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex-between mt-4">
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Showing page {page} of {totalPages || 1}
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn btn-outline" 
            style={{ padding: '0.5rem 1rem' }}
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </button>
          <button 
            className="btn btn-outline" 
            style={{ padding: '0.5rem 1rem' }}
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingUser ? 'Edit User' : 'Create New User'}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {isManager && formData.role === 'admin' && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-danger)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#fca5a5' }}>
                    <ShieldAlert size={18} />
                    <span style={{ fontSize: '0.9rem' }}>You cannot modify an admin user's details.</span>
                  </div>
                )}
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input type="text" className="input-field" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} disabled={isManager && editingUser?.role === 'admin'} />
                </div>
                <div className="input-group">
                  <label className="input-label">Email</label>
                  <input type="email" className="input-field" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} disabled={isManager && editingUser?.role === 'admin'} />
                </div>
                <div className="input-group">
                  <label className="input-label">Password {editingUser && '(Leave blank to keep unchanged)'}</label>
                  <input type="password" className="input-field" minLength="6" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} disabled={isManager && editingUser?.role === 'admin'} required={!editingUser} />
                </div>
                
                {isAdmin && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="input-group">
                      <label className="input-label">Role</label>
                      <select className="input-field" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                        <option value="user" style={{color: 'black'}}>User</option>
                        <option value="manager" style={{color: 'black'}}>Manager</option>
                        <option value="admin" style={{color: 'black'}}>Admin</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label className="input-label">Status</label>
                      <select className="input-field" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                        <option value="active" style={{color: 'black'}}>Active</option>
                        <option value="inactive" style={{color: 'black'}}>Inactive</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isManager && editingUser?.role === 'admin'}>Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
