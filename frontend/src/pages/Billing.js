// filepath: frontend/src/pages/Billing.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Billing.css';

const Billing = () => {
  const { user, hasRole } = useAuth();
  const [payments, setPayments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [summary, setSummary] = useState(null);
  const [pendingPatients, setPendingPatients] = useState([]);

  const [formData, setFormData] = useState({
    patient_id: '',
    amount: '',
    payment_type: 'registration',
    payment_method: 'cash',
    reference_id: ''
  });

  const paymentTypes = [
    { value: 'registration', label: 'Usajili' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'lab', label: 'Maabara' },
    { value: 'pharmacy', label: 'Pharmacy' },
    { value: 'other', label: 'Nyingine' }
  ];

  const paymentMethods = [
    { value: 'cash', label: '💵 Cash' },
    { value: 'mobile_money', label: '📱 Mobile Money' },
    { value: 'card', label: '💳 Card' },
    { value: 'insurance', label: '🏥 Bima' }
  ];

  useEffect(() => {
    if (hasRole('admin', 'receptionist', 'pharmacy')) {
      fetchPayments();
      fetchPatients();
      fetchPendingPatients();
      fetchSummary();
    }
  }, [hasRole]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/payments');
      setPayments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      setPatients(response.data.data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchPendingPatients = async () => {
    try {
      // Get patients who have completed services but might need billing
      const response = await api.get('/patients?payment_status=unpaid');
      setPendingPatients(response.data.data || []);
    } catch (error) {
      console.error('Error fetching pending patients:', error);
    }
  };

  const fetchSummary = async () => {
    if (!hasRole('admin')) return;
    try {
      const response = await api.get('/payments/summary');
      setSummary(response.data.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/payments', formData);
      setMessage({ type: 'success', text: 'Malipo yamesajiliwa kwa mafanikio!' });
      setFormData({
        patient_id: '',
        amount: '',
        payment_type: 'registration',
        payment_method: 'cash',
        reference_id: ''
      });
      setShowForm(false);
      fetchPayments();
      fetchSummary();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Kuna hitilafu' });
    } finally {
      setLoading(false);
    }
  };

  const getMethodLabel = (method) => {
    const found = paymentMethods.find(m => m.value === method);
    return found ? found.label : method;
  };

  const getTypeLabel = (type) => {
    const found = paymentTypes.find(t => t.value === type);
    return found ? found.label : type;
  };

  if (!hasRole('admin', 'receptionist', 'pharmacy')) {
    return (
      <div className="billing-page">
        <div className="alert alert-error">Huna ruhusa ya kuangalia malipo</div>
      </div>
    );
  }

  return (
    <div className="billing-page">
      <div className="page-header">
        <h2>💰 Usimamizi wa Malipo</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Funga' : '➕ Lipa'}
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>{message.text}</div>
      )}

      {/* Summary Cards */}
      {hasRole('admin') && summary && (
        <div className="summary-grid">
          <div className="summary-card">
            <h3>Jumla ya Makusanyo</h3>
            <p className="amount">TZS {parseFloat(summary.total_collected || 0).toLocaleString()}</p>
          </div>
          <div className="summary-card cash">
            <h3>💵 Cash</h3>
            <p className="amount">TZS {parseFloat(summary.cash_total || 0).toLocaleString()}</p>
          </div>
          <div className="summary-card mobile">
            <h3>📱 Mobile Money</h3>
            <p className="amount">TZS {parseFloat(summary.mobile_money_total || 0).toLocaleString()}</p>
          </div>
          <div className="summary-card insurance">
            <h3>🏥 Bima</h3>
            <p className="amount">TZS {parseFloat(summary.insurance_total || 0).toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Pending Patients Section */}
      {pendingPatients.length > 0 && (
        <div className="card">
          <h3>⚠️ Wagonjwa Wanaosubiri Malipo ({pendingPatients.length})</h3>
          <div className="pending-patients-list">
            {pendingPatients.slice(0, 5).map((patient) => (
              <div key={patient.id} className="pending-patient-item">
                <div className="patient-info">
                  <strong>{patient.full_name}</strong> ({patient.patient_number})
                  <br />
                  <small>Hali: {patient.current_stage} | Malipo: {patient.payment_status}</small>
                </div>
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, patient_id: patient.id }));
                    setShowForm(true);
                  }}
                >
                  Lipa
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Form */}
      {showForm && (
        <div className="card form-card">
          <h3>💰 Fanya Malipo</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Mgonjwa *</label>
                <select 
                  name="patient_id" 
                  value={formData.patient_id} 
                  onChange={handleChange} 
                  required
                >
                  <option value="">Chagua Mgonjwa</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} ({p.patient_number})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Kiasi (TZS) *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  placeholder="Andika kiasi"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Aina ya Malipo *</label>
                <select 
                  name="payment_type" 
                  value={formData.payment_type} 
                  onChange={handleChange}
                >
                  {paymentTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Njia ya Kulipa *</label>
                <select 
                  name="payment_method" 
                  value={formData.payment_method} 
                  onChange={handleChange}
                >
                  {paymentMethods.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Inasajili...' : 'Hifadhi Malipo'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payments List */}
      <div className="payments-list">
        <h3>📋 Orodha ya Malipo ({payments.length})</h3>
        {loading ? (
          <p>Inapakia...</p>
        ) : payments.length === 0 ? (
          <div className="empty-state">
            <p>Hamna malipo yaliyofanyika</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Mgonjwa</th>
                <th>Aina</th>
                <th>Kiasi</th>
                <th>Njia</th>
                <th>Alipokea</th>
                <th>Tarehe</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment, index) => (
                <tr key={payment.id}>
                  <td>{index + 1}</td>
                  <td>{payment.patient_name || '-'}</td>
                  <td>{getTypeLabel(payment.payment_type)}</td>
                  <td>TZS {parseFloat(payment.amount).toLocaleString()}</td>
                  <td>{getMethodLabel(payment.payment_method)}</td>
                  <td>{payment.received_by_name || '-'}</td>
                  <td>{new Date(payment.created_at).toLocaleDateString('sw-TZ')}</td>
                  <td>
                    <span className={`status-badge ${payment.status}`}>
                      {payment.status === 'completed' ? '✅ Lipiwa' : 
                       payment.status === 'pending' ? '⏳ inasubiri' : '❌ Imeshindwa'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Billing;