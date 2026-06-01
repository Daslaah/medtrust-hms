import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Reports.css';

const Reports = () => {
  const { hasRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patientReports, setPatientReports] = useState([]);
  const [paymentReports, setPaymentReports] = useState([]);
  const [inventoryReports, setInventoryReports] = useState([]);
  const [workflowReports, setWorkflowReports] = useState(null);

  useEffect(() => {
    if (hasRole('admin')) {
      fetchDashboardStats();
    }
  }, [hasRole]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/dashboard');
      setDashboardStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientReports = async () => {
    try {
      const response = await api.get('/reports/patients');
      setPatientReports(response.data.data);
    } catch (error) {
      console.error('Error fetching patient reports:', error);
    }
  };

  const fetchPaymentReports = async () => {
    try {
      const response = await api.get('/reports/payments');
      setPaymentReports(response.data.data);
    } catch (error) {
      console.error('Error fetching payment reports:', error);
    }
  };

  const fetchInventoryReports = async () => {
    try {
      const response = await api.get('/reports/inventory');
      setInventoryReports(response.data.data);
    } catch (error) {
      console.error('Error fetching inventory reports:', error);
    }
  };

  const fetchWorkflowReports = async () => {
    try {
      const response = await api.get('/reports/workflow');
      setWorkflowReports(response.data.data);
    } catch (error) {
      console.error('Error fetching workflow reports:', error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    switch (tab) {
      case 'patients':
        if (patientReports.length === 0) fetchPatientReports();
        break;
      case 'payments':
        if (paymentReports.length === 0) fetchPaymentReports();
        break;
      case 'inventory':
        if (inventoryReports.length === 0) fetchInventoryReports();
        break;
      case 'workflow':
        if (!workflowReports) fetchWorkflowReports();
        break;
      default:
        break;
    }
  };

  if (!hasRole('admin')) {
    return (
      <div className="reports-page">
        <div className="alert alert-error">Huna ruhusa ya kuangalia ripoti</div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="page-header">
        <h2>📊 Ripoti na Takwimu</h2>
      </div>

      <div className="reports-tabs">
        <button
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => handleTabChange('dashboard')}
        >
          📈 Dashboard
        </button>
        <button
          className={activeTab === 'patients' ? 'active' : ''}
          onClick={() => handleTabChange('patients')}
        >
          👥 Wagonjwa
        </button>
        <button
          className={activeTab === 'payments' ? 'active' : ''}
          onClick={() => handleTabChange('payments')}
        >
          💰 Malipo
        </button>
        <button
          className={activeTab === 'inventory' ? 'active' : ''}
          onClick={() => handleTabChange('inventory')}
        >
          💊 Inventory
        </button>
        <button
          className={activeTab === 'workflow' ? 'active' : ''}
          onClick={() => handleTabChange('workflow')}
        >
          ⚡ Workflow
        </button>
      </div>

      <div className="reports-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-overview">
            {loading ? (
              <p>Inapakia takwimu...</p>
            ) : dashboardStats ? (
              <>
                {/* Patient Statistics */}
                <div className="stats-section">
                  <h3>👥 Takwimu za Wagonjwa</h3>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <h4>Jumla ya Wagonjwa</h4>
                      <p className="stat-number">{dashboardStats.patients.total_patients}</p>
                    </div>
                    <div className="stat-card">
                      <h4>Usajili</h4>
                      <p className="stat-number">{dashboardStats.patients.registration_stage}</p>
                    </div>
                    <div className="stat-card">
                      <h4>Daktari</h4>
                      <p className="stat-number">{dashboardStats.patients.doctor_stage}</p>
                    </div>
                    <div className="stat-card">
                      <h4>Maabara</h4>
                      <p className="stat-number">{dashboardStats.patients.lab_stage}</p>
                    </div>
                    <div className="stat-card">
                      <h4>Pharmacy</h4>
                      <p className="stat-number">{dashboardStats.patients.pharmacy_stage}</p>
                    </div>
                    <div className="stat-card">
                      <h4>Imekamilika</h4>
                      <p className="stat-number">{dashboardStats.patients.completed_stage}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Statistics */}
                <div className="stats-section">
                  <h3>💰 Takwimu za Malipo</h3>
                  <div className="stats-grid">
                    <div className="stat-card highlight">
                      <h4>Jumla ya Makusanyo</h4>
                      <p className="stat-number">TZS {parseFloat(dashboardStats.payments.total_collected || 0).toLocaleString()}</p>
                    </div>
                    <div className="stat-card">
                      <h4>Cash</h4>
                      <p className="stat-number">TZS {parseFloat(dashboardStats.payments.cash_total || 0).toLocaleString()}</p>
                    </div>
                    <div className="stat-card">
                      <h4>Mobile Money</h4>
                      <p className="stat-number">TZS {parseFloat(dashboardStats.payments.mobile_money_total || 0).toLocaleString()}</p>
                    </div>
                    <div className="stat-card">
                      <h4>Bima</h4>
                      <p className="stat-number">TZS {parseFloat(dashboardStats.payments.insurance_total || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Inventory Statistics */}
                <div className="stats-section">
                  <h3>💊 Takwimu za Inventory</h3>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <h4>Jumla ya Dawa</h4>
                      <p className="stat-number">{dashboardStats.inventory.total_medicines}</p>
                    </div>
                    <div className="stat-card warning">
                      <h4>Stock Ndogo</h4>
                      <p className="stat-number">{dashboardStats.inventory.low_stock_items}</p>
                    </div>
                    <div className="stat-card danger">
                      <h4>Zinaisha muda</h4>
                      <p className="stat-number">{dashboardStats.inventory.expiring_soon}</p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="stats-section">
                  <h3>📅 Shughuli ya Wiki Hii</h3>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <h4>Wagonjwa Wapya</h4>
                      <p className="stat-number">{dashboardStats.activity.new_patients_week}</p>
                    </div>
                    <div className="stat-card">
                      <h4>Malipo</h4>
                      <p className="stat-number">{dashboardStats.activity.payments_week}</p>
                    </div>
                    <div className="stat-card">
                      <h4>Consultation</h4>
                      <p className="stat-number">{dashboardStats.activity.consultations_week}</p>
                    </div>
                    <div className="stat-card">
                      <h4>Vipimo</h4>
                      <p className="stat-number">{dashboardStats.activity.lab_tests_week}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p>Hakuna data ya kuonyesha</p>
            )}
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="reports-table">
            <h3>👥 Ripoti ya Wagonjwa</h3>
            <table>
              <thead>
                <tr>
                  <th>Namba</th>
                  <th>Jina</th>
                  <th>Stage</th>
                  <th>Malipo</th>
                  <th>Consultations</th>
                  <th>Lab Tests</th>
                  <th>Prescriptions</th>
                  <th>Jumla Malipo</th>
                </tr>
              </thead>
              <tbody>
                {patientReports.map((patient) => (
                  <tr key={patient.id}>
                    <td>{patient.patient_number}</td>
                    <td>{patient.full_name}</td>
                    <td>{patient.current_stage}</td>
                    <td>{patient.payment_status}</td>
                    <td>{patient.consultation_count}</td>
                    <td>{patient.lab_test_count}</td>
                    <td>{patient.prescription_count}</td>
                    <td>TZS {parseFloat(patient.total_paid || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="reports-table">
            <h3>💰 Ripoti ya Malipo</h3>
            <table>
              <thead>
                <tr>
                  <th>Tarehe</th>
                  <th>Mgonjwa</th>
                  <th>Aina</th>
                  <th>Mthod</th>
                  <th>Kiasi</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paymentReports.map((payment) => (
                  <tr key={payment.id}>
                    <td>{new Date(payment.created_at).toLocaleDateString('sw-TZ')}</td>
                    <td>{payment.patient_name}</td>
                    <td>{payment.payment_type}</td>
                    <td>{payment.payment_method}</td>
                    <td>TZS {parseFloat(payment.amount).toLocaleString()}</td>
                    <td>{payment.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="reports-table">
            <h3>💊 Ripoti ya Inventory</h3>
            <table>
              <thead>
                <tr>
                  <th>Jina</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Bei</th>
                  <th>Expiry</th>
                  <th>Times Prescribed</th>
                  <th>Dispensed</th>
                </tr>
              </thead>
              <tbody>
                {inventoryReports.map((medicine) => (
                  <tr key={medicine.id}>
                    <td>{medicine.name}</td>
                    <td>{medicine.category}</td>
                    <td className={medicine.quantity_in_stock < 10 ? 'warning' : ''}>
                      {medicine.quantity_in_stock}
                    </td>
                    <td>TZS {parseFloat(medicine.unit_price).toLocaleString()}</td>
                    <td className={new Date(medicine.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) ? 'danger' : ''}>
                      {new Date(medicine.expiry_date).toLocaleDateString('sw-TZ')}
                    </td>
                    <td>{medicine.times_prescribed}</td>
                    <td>{medicine.quantity_dispensed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'workflow' && workflowReports && (
          <div className="workflow-stats">
            <h3>⚡ Takwimu za Workflow</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Wagonjwa Jumla (Mwezi)</h4>
                <p className="stat-number">{workflowReports.total_patients}</p>
              </div>
              <div className="stat-card">
                <h4>Wakamilisha &lt; 24h</h4>
                <p className="stat-number">{workflowReports.completed_within_24h}</p>
              </div>
              <div className="stat-card warning">
                <h4>Wanasubiri &gt; 7 Siku</h4>
                <p className="stat-number">{workflowReports.long_waiting_patients}</p>
              </div>
              <div className="stat-card">
                <h4>Wastani Saa Kukamilisha</h4>
                <p className="stat-number">{Math.round(workflowReports.avg_completion_hours || 0)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;