import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
    phone: '',
    role_id: '',
    specialty: ''
  });

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await api.get('/roles');
      setRoles(response.data.data || []);
    } catch (error) {
      console.error('Error loading roles:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, formData);
        alert('Mtumiaji amebadilishwa!');
      } else {
        await api.post('/users', formData);
        alert('Mtumiaji ameundwa!');
      }

      setShowModal(false);
      setEditingUser(null);
      resetForm();
      loadUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Kuna hitilafu');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '', // Don't prefill password for security
      full_name: user.full_name,
      email: user.email || '',
      phone: user.phone || '',
      role_id: user.role_id,
      specialty: user.specialty || ''
    });
    setShowModal(true);
  };

  const handleDelete = (userId) => {
    const user = users.find(u => u.id === userId);
    setUserToDelete(user);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await api.delete(`/users/${userToDelete.id}`);
      alert('Mtumiaji amefutwa!');
      loadUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Kuna hitilafu');
    } finally {
      setShowConfirmModal(false);
      setUserToDelete(null);
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      await api.put(`/users/${user.id}`, {
        ...user,
        is_active: !user.is_active
      });
      alert(`Mtumiaji ${!user.is_active ? 'ameamilishwa' : 'amezimishwa'}!`);
      loadUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Kuna hitilafu');
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      full_name: '',
      email: '',
      phone: '',
      role_id: '',
      specialty: ''
    });
  };

  const openAddModal = () => {
    setEditingUser(null);
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return <div className="users-loading">Inapakia watumiaji...</div>;
  }

  return (
    <div className="users-container">
      <div className="users-header">
        <h1>Usimamizi wa Watumiaji</h1>
        <button className="add-user-btn" onClick={openAddModal}>
          ➕ Ongeza Mtumiaji
        </button>
      </div>

      <div className="users-stats">
        <div className="stat-card">
          <h3>Jumla ya Watumiaji</h3>
          <p className="stat-value">{users.length}</p>
        </div>
        <div className="stat-card">
          <h3>Watumiaji Amilifu</h3>
          <p className="stat-value">{users.filter(u => u.is_active).length}</p>
        </div>
        <div className="stat-card">
          <h3>Madaktari</h3>
          <p className="stat-value">{users.filter(u => u.role_name === 'doctor').length}</p>
        </div>
        <div className="stat-card">
          <h3>Wafanyakazi wa Kupokea</h3>
          <p className="stat-value">{users.filter(u => u.role_name === 'receptionist').length}</p>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Jina Kamili</th>
              <th>Jina la Mtumiaji</th>
              <th>Barua Pepe</th>
              <th>Simu</th>
              <th>Wadhifa</th>
              <th>Mahiri</th>
              <th>Hali</th>
              <th>Tarehe ya Kujiunga</th>
              <th>Kitendo</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.full_name}</td>
                <td>{user.username}</td>
                <td>{user.email || '-'}</td>
                <td>{user.phone || '-'}</td>
                <td>
                  <span className={`role-badge role-${user.role_name}`}>
                    {user.role_name}
                  </span>
                </td>
                <td>{user.specialty || '-'}</td>
                <td>
                  <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                    {user.is_active ? 'Amilifu' : 'Hafifu'}
                  </span>
                </td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(user)}
                      title="Badilisha"
                    >
                      ✏️
                    </button>
                    <button
                      className={`status-btn ${user.is_active ? 'deactivate' : 'activate'}`}
                      onClick={() => toggleUserStatus(user)}
                      title={user.is_active ? 'Zimisha' : 'Amilisha'}
                    >
                      {user.is_active ? '🚫' : '✅'}
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(user.id)}
                      title="Futa"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingUser ? 'Badilisha Mtumiaji' : 'Ongeza Mtumiaji Mpya'}</h2>

            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Jina la Mtumiaji *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    required
                  />
                </div>

                {!editingUser && (
                  <div className="form-group">
                    <label>Nenosiri *</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required={!editingUser}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Jina Kamili *</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Barua Pepe</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Namba ya Simu</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Wadhifa *</label>
                  <select
                    value={formData.role_id}
                    onChange={(e) => setFormData({...formData, role_id: e.target.value})}
                    required
                  >
                    <option value="">Chagua wadhifa</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Mahiri (kwa madaktari)</label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                    placeholder="e.g., Magonjwa ya Moyo"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                  Ghairi
                </button>
                <button type="submit" className="save-btn">
                  {editingUser ? 'Badilisha' : 'Ongeza'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirmModal && userToDelete && (
        <div className="modal-overlay">
          <div className="modal-content confirm-modal">
            <h2>Thibitisha Kufuta</h2>
            <div className="confirm-message">
              <p>Je, una uhakika unataka kufuta mtumiaji huyu?</p>
              <div className="user-info">
                <strong>{userToDelete.full_name}</strong>
                <span>({userToDelete.username})</span>
              </div>
              <p className="warning">Kitendo hiki hakiwezi kutenduliwa!</p>
            </div>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowConfirmModal(false);
                  setUserToDelete(null);
                }}
              >
                Ghairi
              </button>
              <button className="delete-confirm-btn" onClick={confirmDelete}>
                Futa Mtumiaji
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;