import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './Inventory.css';

const Inventory = () => {
  const [medicines, setMedicines] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [expiringSoon, setExpiringSoon] = useState([]);
  const [expired, setExpired] = useState([]);
  const [summary, setSummary] = useState({});
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [adjustment, setAdjustment] = useState({ quantity: 0, reason: '' });
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      const [medicinesRes, lowStockRes, expiringRes, expiredRes, summaryRes, categoriesRes] = await Promise.all([
        api.get('/medicines'),
        api.get('/medicines/inventory/low-stock'),
        api.get('/medicines/inventory/expiring-soon'),
        api.get('/medicines/inventory/expired'),
        api.get('/medicines/inventory/summary'),
        api.get('/medicines/categories')
      ]);

      setMedicines(medicinesRes.data.data || []);
      setLowStock(lowStockRes.data.data || []);
      setExpiringSoon(expiringRes.data.data || []);
      setExpired(expiredRes.data.data || []);
      setSummary(summaryRes.data.data || {});
      setCategories(categoriesRes.data.data || []);
    } catch (error) {
      console.error('Error loading inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStockAdjustment = async () => {
    if (!selectedMedicine || !adjustment.quantity || !adjustment.reason) {
      alert('Tafadhali jaza taarifa zote');
      return;
    }

    try {
      await api.post(`/medicines/${selectedMedicine.id}/adjust-stock`, {
        adjustment: parseInt(adjustment.quantity),
        reason: adjustment.reason
      });

      alert('Stock imerekebishwa!');
      setShowAdjustModal(false);
      setSelectedMedicine(null);
      setAdjustment({ quantity: 0, reason: '' });
      loadInventoryData();
    } catch (error) {
      alert(error.response?.data?.message || 'Kuna hitilafu');
    }
  };

  const openAdjustModal = (medicine) => {
    setSelectedMedicine(medicine);
    setShowAdjustModal(true);
  };

  if (loading) {
    return <div className="inventory-loading">Inapakia taarifa za dawa...</div>;
  }

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h1>Usimamizi wa Dawa na Vifaa</h1>
        <div className="inventory-tabs">
          <button
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Muhtasari
          </button>
          <button
            className={activeTab === 'medicines' ? 'active' : ''}
            onClick={() => setActiveTab('medicines')}
          >
            Orodha ya Dawa ({medicines.length})
          </button>
          <button
            className={activeTab === 'alerts' ? 'active' : ''}
            onClick={() => setActiveTab('alerts')}
          >
            Tahadhari ({lowStock.length + expiringSoon.length + expired.length})
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="inventory-overview">
          <div className="summary-cards">
            <div className="summary-card">
              <h3>Jumla ya Dawa</h3>
              <p className="summary-value">{summary.total_medicines || 0}</p>
            </div>
            <div className="summary-card">
              <h3>Jumla ya Thamani</h3>
              <p className="summary-value">TSh {summary.total_value?.toLocaleString() || 0}</p>
            </div>
            <div className="summary-card">
              <h3>Bei ya Wastani</h3>
              <p className="summary-value">TSh {Math.round(summary.avg_price || 0).toLocaleString()}</p>
            </div>
            <div className="summary-card">
              <h3>Hisa Ndogo</h3>
              <p className="summary-value">{summary.min_stock || 0}</p>
            </div>
          </div>

          <div className="alerts-preview">
            <h3>Tahadhari Muhimu</h3>
            <div className="alerts-grid">
              <div className="alert-card low-stock">
                <h4>Dawa Chache ({lowStock.length})</h4>
                <p>Dawa zilizo chini ya kiwango</p>
              </div>
              <div className="alert-card expiring">
                <h4>Karibu Kufa ({expiringSoon.length})</h4>
                <p>Dawa zitakazo kufa muda mfupi</p>
              </div>
              <div className="alert-card expired">
                <h4>Zimekufa ({expired.length})</h4>
                <p>Dawa zilizokwisha muda</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'medicines' && (
        <div className="medicines-list">
          <div className="medicines-header">
            <h3>Orodha ya Dawa Zote</h3>
            <div className="filter-controls">
              <select>
                <option value="">Aina Zote</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="medicines-table">
            <table>
              <thead>
                <tr>
                  <th>Jina</th>
                  <th>Aina</th>
                  <th>Hisa</th>
                  <th>Bei ya Unit</th>
                  <th>Tarehe ya Kufa</th>
                  <th>Kitendo</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map(medicine => (
                  <tr key={medicine.id}>
                    <td>{medicine.name}</td>
                    <td>{medicine.category}</td>
                    <td className={medicine.quantity_in_stock <= 10 ? 'low-stock' : ''}>
                      {medicine.quantity_in_stock}
                    </td>
                    <td>TSh {medicine.unit_price?.toLocaleString()}</td>
                    <td>{medicine.expiry_date ? new Date(medicine.expiry_date).toLocaleDateString() : '-'}</td>
                    <td>
                      <button
                        className="adjust-btn"
                        onClick={() => openAdjustModal(medicine)}
                      >
                        Rekebisha
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="inventory-alerts">
          <div className="alert-section">
            <h3>Dawa Chache (Stock &lt; 10)</h3>
            {lowStock.length > 0 ? (
              <div className="alert-items">
                {lowStock.map(medicine => (
                  <div key={medicine.id} className="alert-item low-stock">
                    <div className="alert-info">
                      <strong>{medicine.name}</strong>
                      <span>Hisa: {medicine.quantity_in_stock}</span>
                    </div>
                    <button
                      className="adjust-btn"
                      onClick={() => openAdjustModal(medicine)}
                    >
                      Rekebisha
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p>Hakuna dawa chache kwa sasa</p>
            )}
          </div>

          <div className="alert-section">
            <h3>Dawa Zitakazo Kufa (Siku 30 zijazo)</h3>
            {expiringSoon.length > 0 ? (
              <div className="alert-items">
                {expiringSoon.map(medicine => (
                  <div key={medicine.id} className="alert-item expiring">
                    <div className="alert-info">
                      <strong>{medicine.name}</strong>
                      <span>Tarehe: {new Date(medicine.expiry_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>Hakuna dawa zitakazo kufa muda mfupi</p>
            )}
          </div>

          <div className="alert-section">
            <h3>Dawa Zilizokwisha Muda</h3>
            {expired.length > 0 ? (
              <div className="alert-items">
                {expired.map(medicine => (
                  <div key={medicine.id} className="alert-item expired">
                    <div className="alert-info">
                      <strong>{medicine.name}</strong>
                      <span>Tarehe: {new Date(medicine.expiry_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>Hakuna dawa zilizokwisha muda</p>
            )}
          </div>
        </div>
      )}

      {showAdjustModal && selectedMedicine && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Rekebisha Stock - {selectedMedicine.name}</h3>
            <div className="modal-body">
              <div className="current-stock">
                <p><strong>Hisa ya Sasa:</strong> {selectedMedicine.quantity_in_stock}</p>
              </div>
              <div className="form-group">
                <label>Kiasi cha Marekebisho:</label>
                <input
                  type="number"
                  value={adjustment.quantity}
                  onChange={(e) => setAdjustment({...adjustment, quantity: e.target.value})}
                  placeholder="Weka namba chanya (ongeza) au hasi (punguza)"
                />
              </div>
              <div className="form-group">
                <label>Sababu:</label>
                <textarea
                  value={adjustment.reason}
                  onChange={(e) => setAdjustment({...adjustment, reason: e.target.value})}
                  placeholder="Eleza sababu ya marekebisho"
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowAdjustModal(false)}>
                Ghairi
              </button>
              <button className="save-btn" onClick={handleStockAdjustment}>
                Hifadhi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;