import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Dashboard.css';

const Appointments = () => {
  const { user, hasRole } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    patient_id: '',
    specialty: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    notes: ''
  });

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/appointments');
      setAppointments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPatients = useCallback(async () => {
    try {
      const url = user.role === 'doctor' ? '/patients?stage=doctor' : '/patients';
      const response = await api.get(url);
      setPatients(response.data.data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  }, [user?.role]);

  const fetchDoctors = useCallback(async () => {
    try {
      const response = await api.get('/users/doctors');
      setDoctors(response.data.data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  }, []);

  useEffect(() => {
    if (hasRole('admin', 'doctor', 'receptionist')) {
      fetchAppointments();
      fetchPatients();
      fetchDoctors();
    }
  }, [hasRole, fetchAppointments, fetchPatients, fetchDoctors]);

  const movePatientStage = async (patientId, nextStage) => {
    try {
      await api.patch(`/patients/${patientId}/stage`, { current_stage: nextStage });
      fetchPatients();
      setMessage({ type: 'success', text: 'Mgonjwa amepelekwa kwenye hatua inayofuata' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Kuna hitilafu' });
    }
  };

  const specialityOptions = [
    { value: '', label: 'Chagua aina ya daktari' },
    { value: 'dentist', label: 'Dentist' },
    { value: 'cardiologist', label: 'Doctor wa moyo' },
    { value: 'geriatrician', label: 'Doctor wa wazee' },
    { value: 'pediatrician', label: 'Doctor wa watoto' },
    { value: 'general_practitioner', label: 'General Practitioner' }
  ];

  const availableDoctors = doctors.filter((doctor) => {
    if (!formData.specialty) return true;
    return doctor.specialty === formData.specialty;
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        patient_id: formData.patient_id,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        notes: formData.notes
      };
      if (user.role === 'admin') {
        payload.doctor_id = formData.doctor_id;
      }
      await api.post('/appointments', payload);
      setMessage({ type: 'success', text: 'Miadi imehifadhiwa kwa mafanikio!' });
      setFormData({ patient_id: '', specialty: '', doctor_id: '', appointment_date: '', appointment_time: '', notes: '' });
      setShowForm(false);
      fetchAppointments();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Kuna hitilafu' });
    } finally {
      setLoading(false);
    }
  };

  if (!hasRole('admin', 'doctor', 'receptionist')) {
    return (
      <div className="dashboard">
        <div className="welcome-section">
          <h2>👩‍⚕️ Huna Ruhusa</h2>
          <p>Huna ruhusa ya kuangalia au kusimamia miadi.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h2>📅 Usimamizi wa Miadi</h2>
        {hasRole('admin', 'doctor', 'receptionist') && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Funga' : '➕ Panga Miadi'}
          </button>
        )}
      </div>

      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      {showForm && (
        <div className="card form-card">
          <h3>➕ Panga Miadi Mpya</h3>
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

              <div className="form-group">
                <label>Aina ya Daktari *</label>
                <select name="specialty" value={formData.specialty} onChange={handleChange} required>
                  {specialityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Daktari *</label>
                <select name="doctor_id" value={formData.doctor_id} onChange={handleChange} required>
                  <option value="">Chagua daktari</option>
                  {availableDoctors.length === 0 ? (
                    <option value="" disabled>Hakuna madaktari wa specialty hii</option>
                  ) : (
                    availableDoctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.full_name} {doctor.specialty ? `(${doctor.specialty})` : ''}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="form-group">
                <label>Tarehe ya Miadi *</label>
                <input
                  type="date"
                  name="appointment_date"
                  value={formData.appointment_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Muda *</label>
                <input
                  type="time"
                  name="appointment_time"
                  value={formData.appointment_time}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group full-width">
                <label>Maelezo</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Unaweza kuweka dalili au maelezo..."
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Inarundika...' : 'Hifadhi Miadi'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="patients-list">
        <h3>📋 Orodha ya Miadi ({appointments.length})</h3>
        {loading ? (
          <p>Inapakia...</p>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <p>Hamna miadi iliyopangwa.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Mgonjwa</th>
                <th>Daktari</th>
                <th>Tarehe</th>
                <th>Muda</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment, index) => (
                <tr key={appointment.id}>
                  <td>{index + 1}</td>
                  <td>{appointment.patient_name || '-'}</td>
                  <td>{appointment.doctor_name || '-'}</td>
                  <td>{new Date(appointment.appointment_date).toLocaleDateString('sw-TZ')}</td>
                  <td>{appointment.appointment_time}</td>
                  <td>{appointment.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {user.role === 'doctor' && (
        <div className="patients-list">
          <h3>👨‍⚕️ Wagonjwa kwa Daktari ({patients.length})</h3>
          {patients.length === 0 ? (
            <div className="empty-state">
              <p>Hakuna mgonjwa aliye kwenye stage ya doctor.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Namba</th>
                  <th>Jina</th>
                  <th>Malipo</th>
                  <th>Stage</th>
                  <th>Kitendo</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient, index) => (
                  <tr key={patient.id}>
                    <td>{index + 1}</td>
                    <td>{patient.patient_number || '-'}</td>
                    <td>{patient.full_name}</td>
                    <td>{patient.payment_status || 'unpaid'}</td>
                    <td>{patient.current_stage || 'registration'}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => movePatientStage(patient.id, 'lab')}
                      >
                        Tuma Maabara
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Appointments;
