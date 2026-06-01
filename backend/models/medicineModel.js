const pool = require('../config/db');

const Medicine = {
  async getAll(filters = {}) {
    let query = `SELECT * FROM medicines`;
    const conditions = [];
    const params = [];

    if (filters.category) {
      conditions.push('category = ?');
      params.push(filters.category);
    }
    if (filters.name) {
      conditions.push('name LIKE ?');
      params.push(`%${filters.name}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY name ASC';

    const [rows] = await pool.query(query, params);
    return rows;
  },

  async getById(id) {
    const [rows] = await pool.query(
      `SELECT * FROM medicines WHERE id = ?`,
      [id]
    );
    return rows[0];
  },

  async create(data) {
    const { name, category, unit_price, quantity_in_stock, expiry_date, description } = data;
    const [result] = await pool.query(
      `INSERT INTO medicines (name, category, unit_price, quantity_in_stock, expiry_date, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, category || '', unit_price, quantity_in_stock || 0, expiry_date || null, description || '']
    );
    return result.insertId;
  },

  async update(id, data) {
    const { name, category, unit_price, quantity_in_stock, expiry_date, description } = data;
    await pool.query(
      `UPDATE medicines SET name = ?, category = ?, unit_price = ?, quantity_in_stock = ?, expiry_date = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [name, category || '', unit_price, quantity_in_stock || 0, expiry_date || null, description || '', id]
    );
    return true;
  },

  async delete(id) {
    await pool.query(`DELETE FROM medicines WHERE id = ?`, [id]);
    return true;
  },

  // Inventory management methods
  async getLowStock(limit = 10) {
    const [rows] = await pool.query(
      `SELECT * FROM medicines WHERE quantity_in_stock <= ? ORDER BY quantity_in_stock ASC`,
      [limit]
    );
    return rows;
  },

  async getExpiringSoon(days = 30) {
    const [rows] = await pool.query(
      `SELECT * FROM medicines WHERE expiry_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY) AND expiry_date >= CURDATE() ORDER BY expiry_date ASC`,
      [days]
    );
    return rows;
  },

  async getExpired() {
    const [rows] = await pool.query(
      `SELECT * FROM medicines WHERE expiry_date < CURDATE() ORDER BY expiry_date ASC`
    );
    return rows;
  },

  async adjustStock(id, adjustment, reason, userId) {
    // First get current stock
    const medicine = await this.getById(id);
    if (!medicine) {
      throw new Error('Medicine not found');
    }

    const newStock = medicine.quantity_in_stock + adjustment;
    if (newStock < 0) {
      throw new Error('Insufficient stock for adjustment');
    }

    // Update stock
    await pool.query(
      `UPDATE medicines SET quantity_in_stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [newStock, id]
    );

    // Log the adjustment (we'll need an inventory_log table for this)
    // For now, we'll just return success
    return { oldStock: medicine.quantity_in_stock, newStock, adjustment };
  },

  async getInventorySummary() {
    const [rows] = await pool.query(`
      SELECT
        COUNT(*) as total_medicines,
        SUM(quantity_in_stock) as total_stock_value,
        SUM(quantity_in_stock * unit_price) as total_value,
        AVG(unit_price) as avg_price,
        MIN(quantity_in_stock) as min_stock,
        MAX(quantity_in_stock) as max_stock
      FROM medicines
    `);
    return rows[0];
  },

  async getCategories() {
    const [rows] = await pool.query(
      `SELECT DISTINCT category FROM medicines WHERE category IS NOT NULL AND category != '' ORDER BY category ASC`
    );
    return rows.map(row => row.category);
  }
};

module.exports = Medicine;
