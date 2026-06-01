import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Dashboard.css';

const Pharmacy = () => {
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    patient_id: '',
    medicine_id: '',
    quantity: 1,
    notes: ''
  });

  useEffect(() => {
    fetchPatients();
    fetchMedicines();
    fetchPrescriptions();
    fetchHistory();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients?stage=pharmacy');
      setPatients(response.data.data || []);
    } catch (error) {
      console.error('Error fetching pharmacy patients:', error);
    }
  };

  const fetchMedicines = async () => {
    try {
      const response = await api.get('/medicines');
      setMedicines(response.data.data || []);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const response = await api.get('/prescriptions?status=pending');
      setPrescriptions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await api.get('/prescriptions?status=dispensed');
      setHistory(response.data.data || []);
    } catch (error) {
      console.error('Error fetching dispensed history:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'quantity' ? Number(value) : value
    });
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/prescriptions', {
        ...formData
      });
      setMessage({ type: 'success', text: 'Agizo la dawa limehifadhiwa' });
      setFormData({ patient_id: '', medicine_id: '', quantity: 1, notes: '' });
      fetchPatients();
      fetchPrescriptions();
      fetchHistory();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Kuna hitilafu' });
    } finally {
      setLoading(false);
    }
  };

  const handleDispense = async (id) => {
    setLoading(true);
    try {
      await api.put(`/prescriptions/${id}/dispense`);
      setMessage({ type: 'success', text: 'Dawa imeweza kutolewa' });
      fetchPrescriptions();
      fetchHistory();
      fetchPatients();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Kuna hitilafu' });
    } finally {
      setLoading(false);
    }
  };

  const markCompleted = async (patientId) => {
    try {
      await api.patch(`/patients/${patientId}/stage`, { current_stage: 'completed' });
      setMessage({ type: 'success', text: 'Mgonjwa amepewa huduma na imekamilika.' });
      fetchPatients();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Kuna hitilafu' });
    }
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <h2>💊 Pharmacy</h2>
      </div>

      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="card form-card">
        <h3>➕ Ongeza Agizo la Dawa</h3>
        <form onSubmit={handleCreatePrescription}>
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
              <label>Dawa *</label>
              <select name="medicine_id" value={formData.medicine_id} onChange={handleChange} required>
                <option value="">Chagua dawa</option>
                {medicines.map((medicine) => (
                  <option key={medicine.id} value={medicine.id}>
                    {medicine.name} - {medicine.category || 'Jamii'} ({medicine.quantity_in_stock} kwenye hisabu)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Kiasi *</label>
              <input
                type="number"
                name="quantity"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group full-width">
              <label>Maelezo ya Agizo</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Maelezo ya ziada kuhusu agizo la dawa"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Inahifadhi...' : 'Hifadhi Agizo'}
            </button>
          </div>
        </form>
      </div>

      <div className="patients-list">
        <h3>📋 Wagonjwa kwa Pharmacy ({patients.length})</h3>
        {patients.length === 0 ? (
          <div className="empty-state">
            <p>Hamna wagonjwa waliosogezwa kwa Pharmacy.</p>
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
                <th>Vitendo</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient, index) => (
                <tr key={patient.id}>
                  <td>{index + 1}</td>
                  <td>{patient.patient_number || '-'}</td>
                  <td>{patient.full_name}</td>
                  <td>{patient.payment_status || 'unpaid'}</td>
                  <td>{patient.current_stage || 'pharmacy'}</td>
                  <td>
                    <button className="btn btn-sm btn-primary" onClick={() => markCompleted(patient.id)}>
                      Kumaliza
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="patients-list">
        <h3>🗂️ Maagizo ya Dawa Yanayokusubiri ({prescriptions.length})</h3>
        {prescriptions.length === 0 ? (
          <div className="empty-state">
            <p>Hakuna maagizo ya dawa yaliyosubiriwa.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Mgonjwa</th>
                <th>Dawa</th>
                <th>Kiasi</th>
                <th>Bei</th>
                <th>Jumla</th>
                <th>Vitendo</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.patient_name || '-'}</td>
                  <td>{item.medicine_name || '-'}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unit_price}</td>
                  <td>{item.total_price}</td>
                  <td>
                    <button className="btn btn-sm btn-secondary" onClick={() => handleDispense(item.id)}>
                      Toa Dawa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="patients-list">
        <h3>📜 Historia ya Maagizo yaliyotolewa ({history.length})</h3>
        {history.length === 0 ? (
          <div className="empty-state">
            <p>Hakuna historia ya maagizo yaliyotolewa.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Mgonjwa</th>
                <th>Dawa</th>
                <th>Kiasi</th>
                <th>Jumla</th>
                <th>Tarehe ya utoaji</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.patient_name || '-'}</td>
                  <td>{item.medicine_name || '-'}</td>
                  <td>{item.quantity}</td>
                  <td>{item.total_price}</td>
                  <td>{item.dispensed_at ? new Date(item.dispensed_at).toLocaleString('sw-TZ') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Pharmacy;
