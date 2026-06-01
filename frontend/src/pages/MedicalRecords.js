import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Dashboard.css';

const MedicalRecords = () => {
  const { hasRole } = useAuth();
  const [patients, setPatients] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    patient_id: '',
    diagnosis: '',
    symptoms: '',
    prescription: '',
    notes: '',
    next_stage: 'lab'
  });

  useEffect(() => {
    if (hasRole('doctor', 'admin')) {
      fetchPatients();
      fetchRecords();
    }
  }, [hasRole]);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients?stage=doctor');
      setPatients(response.data.data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await api.get('/medical-records');
      setRecords(response.data.data || []);
    } catch (error) {
      console.error('Error fetching records:', error);
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
      await api.post('/medical-records', formData);
      setMessage({ type: 'success', text: 'Rekodi ya matibabu imehifadhiwa!' });
      setFormData({
        patient_id: '',
        diagnosis: '',
        symptoms: '',
        prescription: '',
        notes: '',
        next_stage: 'lab'
      });
      fetchPatients();
      fetchRecords();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Kuna hitilafu' });
    } finally {
      setLoading(false);
    }
  };

  if (!hasRole('doctor', 'admin')) {
    return (
      <div className="dashboard">
        <div className="welcome-section">
          <h2>👩‍⚕️ Huna Ruhusa</h2>
          <p>Huna ruhusa ya kuangalia rekodi za matibabu.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h2>📋 Rekodi za Matibabu</h2>
      </div>

      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="card form-card">
        <h3>➕ Ongeza Rekodi Mpya</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Mgonjwa *</label>
              <select name="patient_id" value={formData.patient_id} onChange={handleChange} required>
                <option value="">Chagua mgonjwa</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.full_name} ({patient.patient_number})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group full-width">
              <label>Uchunguzi / Diagnosis *</label>
              <textarea
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                required
                placeholder="Andika uchunguzi..."
              />
            </div>

            <div className="form-group full-width">
              <label>Dalili / Symptoms</label>
              <textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
                placeholder="Andika dalili..."
              />
            </div>

            <div className="form-group full-width">
              <label>Prescription</label>
              <textarea
                name="prescription"
                value={formData.prescription}
                onChange={handleChange}
                placeholder="Andika dawa au maagizo..."
              />
            </div>

            <div className="form-group full-width">
              <label>Maelezo ya ziada</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Maelezo ya ziada..."
              />
            </div>

            <div className="form-group">
              <label>Next Stage *</label>
              <select name="next_stage" value={formData.next_stage} onChange={handleChange} required>
                <option value="lab">Lab</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Inahifadhi...' : 'Hifadhi Rekodi'}
            </button>
          </div>
        </form>
      </div>

      <div className="patients-list">
        <h3>📋 Rekodi za Matibabu ({records.length})</h3>
        {loading ? (
          <p>Inapakia...</p>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <p>Hakuna rekodi za matibabu zilizohifadhiwa.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Mgonjwa</th>
                <th>Daktari</th>
                <th>Uchunguzi</th>
                <th>Maelezo</th>
                <th>Stage</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={record.id}>
                  <td>{index + 1}</td>
                  <td>{record.patient_name || '-'}</td>
                  <td>{record.doctor_name || '-'}</td>
                  <td>{record.diagnosis}</td>
                  <td>{record.notes || record.prescription || ' - '}</td>
                  <td>{record.created_at ? new Date(record.created_at).toLocaleDateString('sw-TZ') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MedicalRecords;
