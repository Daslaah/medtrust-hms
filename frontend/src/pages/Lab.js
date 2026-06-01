import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Dashboard.css';

const today = new Date().toISOString().split('T')[0];

const Lab = () => {
  const [patients, setPatients] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    patient_id: '',
    test_type: '',
    test_date: today,
    notes: ''
  });
  const [activeTest, setActiveTest] = useState(null);
  const [results, setResults] = useState('');
  const [resultStatus, setResultStatus] = useState('completed');
  const [nextStage, setNextStage] = useState('pharmacy');

  useEffect(() => {
    fetchPatients();
    fetchTests();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await api.get('/patients?stage=lab');
      setPatients(response.data.data || []);
    } catch (error) {
      console.error('Error fetching lab patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTests = async () => {
    try {
      const response = await api.get('/lab-tests?status=pending');
      setTests(response.data.data || []);
    } catch (error) {
      console.error('Error fetching lab tests:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/lab-tests', formData);
      setMessage({ type: 'success', text: 'Omba upimaji umehifadhiwa' });
      setFormData({ patient_id: '', test_type: '', test_date: today, notes: '' });
      fetchTests();
      fetchPatients();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Kuna hitilafu' });
    } finally {
      setLoading(false);
    }
  };

  const openResultForm = (test) => {
    setActiveTest(test);
    setResults(test.results || '');
    setResultStatus(test.status || 'completed');
    setNextStage('pharmacy');
  };

  const handleSaveResults = async () => {
    if (!activeTest) return;
    setLoading(true);
    try {
      await api.put(`/lab-tests/${activeTest.id}`, {
        results,
        status: resultStatus,
        notes: activeTest.notes,
        next_stage: nextStage
      });
      setMessage({ type: 'success', text: 'Matokeo yamehifadhiwa' });
      setActiveTest(null);
      setResults('');
      fetchTests();
      fetchPatients();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Kuna hitilafu' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <h2>🔬 Maabara</h2>
      </div>

      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="card form-card">
        <h3>➕ Omba Upimaji Mpya</h3>
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
              <label>Aina ya Upimaji *</label>
              <input
                type="text"
                name="test_type"
                value={formData.test_type}
                onChange={handleChange}
                required
                placeholder="Mfano: CBC, X-ray, Ultrasound"
              />
            </div>

            <div className="form-group">
              <label>Tarehe ya Upimaji</label>
              <input
                type="date"
                name="test_date"
                value={formData.test_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group full-width">
              <label>Maelezo</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Maelezo ya ziada kuhusu upimaji..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Inahifadhi...' : 'Omba Upimaji'}
            </button>
          </div>
        </form>
      </div>

      <div className="patients-list">
        <h3>📋 Orodha ya Maabara ({patients.length})</h3>
        {loading ? (
          <p>Inapakia...</p>
        ) : patients.length === 0 ? (
          <div className="empty-state">
            <p>Hamna wagonjwa waliosogezwa kwa Maabara.</p>
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
              </tr>
            </thead>
            <tbody>
              {patients.map((patient, index) => (
                <tr key={patient.id}>
                  <td>{index + 1}</td>
                  <td>{patient.patient_number || '-'}</td>
                  <td>{patient.full_name}</td>
                  <td>{patient.payment_status || 'unpaid'}</td>
                  <td>{patient.current_stage || 'lab'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="patients-list">
        <h3>🧪 Maombi ya Upimaji ({tests.length})</h3>
        {tests.length === 0 ? (
          <div className="empty-state">
            <p>Hamna maombi ya upimaji yaliyosubiriwa.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Mgonjwa</th>
                <th>Aina</th>
                <th>Tarehe</th>
                <th>Status</th>
                <th>Vitendo</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test, index) => (
                <tr key={test.id}>
                  <td>{index + 1}</td>
                  <td>{test.patient_name || '-'}</td>
                  <td>{test.test_type}</td>
                  <td>{new Date(test.test_date).toLocaleDateString('sw-TZ')}</td>
                  <td>{test.status}</td>
                  <td>
                    <button className="btn btn-sm btn-secondary" onClick={() => openResultForm(test)}>
                      Rekodi Matokeo
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {activeTest && (
        <div className="card form-card">
          <h3>📌 Rekodi Matokeo ya {activeTest.patient_name}</h3>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Matokeo</label>
              <textarea
                value={results}
                onChange={(e) => setResults(e.target.value)}
                placeholder="Andika matokeo ya upimaji..."
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select value={resultStatus} onChange={(e) => setResultStatus(e.target.value)}>
                <option value="completed">Completed</option>
                <option value="in_progress">In Progress</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="form-group">
              <label>Next Stage</label>
              <select value={nextStage} onChange={(e) => setNextStage(e.target.value)}>
                <option value="lab">Lab</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleSaveResults} disabled={loading}>
              {loading ? 'Inahifadhi...' : 'Hifadhi Matokeo'}
            </button>
            <button className="btn btn-secondary" onClick={() => setActiveTest(null)}>
              Funga
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lab;
