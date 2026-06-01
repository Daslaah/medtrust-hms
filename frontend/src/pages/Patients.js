// filepath: frontend/src/pages/Patients.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Patients.css';

const Patients = () => {
  const { hasRole } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    full_name: '',
    gender: '',
    date_of_birth: '',
    phone: '',
    email: '',
    address: '',
    emergency_contact: '',
    emergency_phone: '',
    payment_status: 'unpaid',
    payment_amount: '',
    payment_method: 'cash',
    current_stage: 'registration'
  });

  // Fetch patients
  useEffect(() => {
    if (hasRole('admin', 'receptionist', 'doctor')) {
      fetchPatients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await api.get('/patients');
      setPatients(response.data.data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingPatient) {
        await api.put(`/patients/${editingPatient}`, formData);
        setMessage({ type: 'success', text: 'Taarifa za mgonjwa zimebadilishwa!' });
      } else {
        await api.post('/patients', formData);
        setMessage({ type: 'success', text: 'Mgonjwa amesajiliwa kwa mafanikio!' });
      }
      setFormData({
        full_name: '',
        gender: '',
        date_of_birth: '',
        phone: '',
        email: '',
        address: '',
        emergency_contact: '',
        emergency_phone: '',
        payment_status: 'unpaid',
        payment_amount: '',
        payment_method: 'cash',
        current_stage: 'registration'
      });
      setShowForm(false);
      setEditingPatient(null);
      fetchPatients();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Kuna hitilafu' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (patient) => {
    setFormData(patient);
    setEditingPatient(patient.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Una uhakika unataka kufuta mgonjwa huyu?')) {
      try {
        await api.delete(`/patients/${id}`);
        setMessage({ type: 'success', text: 'Mgonjwa amefutwa' });
        fetchPatients();
      } catch (error) {
        setMessage({ type: 'error', text: 'Kuna hitilafu katika kufuta' });
      }
    }
  };

  if (!hasRole('admin', 'receptionist', 'doctor')) {
    return (
      <div className="patients-page">
        <div className="alert alert-error">
          Huna ruhusa ya kuangalia wagonjwa
        </div>
      </div>
    );
  }

  return (
    <div className="patients-page">
      <div className="page-header">
        <h2>📋 Usimamizi wa Wagonjwa</h2>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            setEditingPatient(null);
            setFormData({
              full_name: '',
              gender: '',
              date_of_birth: '',
              phone: '',
              email: '',
              address: '',
              emergency_contact: '',
              emergency_phone: '',
              payment_status: 'unpaid',
              payment_amount: '',
              payment_method: 'cash',
              current_stage: 'registration'
            });
          }}
        >
          {showForm ? 'Funga Form' : '➕ Sajili Mgonjwa'}
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="card form-card">
          <h3>{editingPatient ? '✏️ Badilisha Taarifa' : '➕ Sajili Mgonjwa Mpya'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Jina kamili *</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  placeholder="Andika jina kamili"
                />
              </div>

              <div className="form-group">
                <label>Jinsia *</label>
                <select name="gender" value={formData.gender} onChange={handleChange} required>
                  <option value="">Chagua</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div className="form-group">
                <label>Tarehe ya Kuzaliwa *</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Namba ya Simu</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="255700000000"
                />
              </div>

              <div className="form-group">
                <label>Barua Pepe (Email)</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                />
              </div>

              <div className="form-group">
                <label>Anwani</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Mahali anapoishi"
                />
              </div>

              <div className="form-group">
                <label>Mawasiliano ya Dharura</label>
                <input
                  type="text"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleChange}
                  placeholder="Jina la mtu wa karibu"
                />
              </div>

              <div className="form-group">
                <label>Simu ya Mawasiliano</label>
                <input
                  type="tel"
                  name="emergency_phone"
                  value={formData.emergency_phone}
                  onChange={handleChange}
                  placeholder="255700000000"
                />
              </div>

              <div className="form-group">
                <label>Payment Status</label>
                <select
                  name="payment_status"
                  value={formData.payment_status}
                  onChange={handleChange}
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                </select>
              </div>

              <div className="form-group">
                <label>Payment Amount (TZS)</label>
                <input
                  type="number"
                  name="payment_amount"
                  value={formData.payment_amount}
                  onChange={handleChange}
                  placeholder="Andika kiasi"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                >
                  <option value="cash">Cash</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="card">Card</option>
                  <option value="insurance">Insurance</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Inahifadhi...' : editingPatient ? 'Badilisha' : 'Hifadhi'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="patients-list">
        <h3>📋 Orodha ya Wagonjwa ({patients.length})</h3>
        {loading ? (
          <p>Inapakia...</p>
        ) : patients.length === 0 ? (
          <div className="empty-state">
            <p>Hamna wagonjwa waliosajiliwa</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              Sajili Mgonjwa wa Kwanza
            </button>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Namba ya Mgonjwa</th>
                <th>Jina</th>
                <th>Jinsia</th>
                <th>Umri</th>
                <th>Simu</th>
                <th>Malipo</th>
                <th>Stage</th>
                <th>Tarehe ya Kusajili</th>
                <th>Vitendo</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient, index) => {
                const age = patient.date_of_birth 
                  ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear()
                  : '-';
                return (
                  <tr key={patient.id}>
                    <td>{index + 1}</td>
                    <td>{patient.patient_number || '-'}</td>
                    <td>{patient.full_name}</td>
                    <td>{patient.gender === 'male' ? 'M' : 'F'}</td>
                    <td>{age}</td>
                    <td>{patient.phone || '-'}</td>
                    <td>{patient.payment_status || 'unpaid'}</td>
                    <td>{patient.current_stage || 'registration'}</td>
                    <td>{new Date(patient.created_at).toLocaleDateString('sw-TZ')}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleEdit(patient)}
                      >
                        ✏️
                      </button>
                      {hasRole('admin') && (
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(patient.id)}
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Patients;