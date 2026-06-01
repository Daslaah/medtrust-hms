const Medicine = require('../models/medicineModel');

const MedicineController = {
  async getAll(req, res) {
    try {
      const filters = {};
      if (req.query.category) filters.category = req.query.category;
      if (req.query.name) filters.name = req.query.name;

      const medicines = await Medicine.getAll(filters);
      res.json({ success: true, data: medicines });
    } catch (error) {
      console.error('Get medicines error:', error);
      res.status(500).json({ success: false, message: 'Kuna hitilafu katika mfumo' });
    }
  },

  async getById(req, res) {
    try {
      const medicine = await Medicine.getById(req.params.id);
      if (!medicine) {
        return res.status(404).json({ success: false, message: 'Dawa haikupatikana' });
      }
      res.json({ success: true, data: medicine });
    } catch (error) {
      console.error('Get medicine by id error:', error);
      res.status(500).json({ success: false, message: 'Kuna hitilafu katika mfumo' });
    }
  },

  async create(req, res) {
    try {
      const { name, category, unit_price, quantity_in_stock, expiry_date, description } = req.body;
      if (!name || unit_price == null) {
        return res.status(400).json({ success: false, message: 'Tafadhali toa jina na bei ya dawa' });
      }

      const id = await Medicine.create({
        name,
        category,
        unit_price,
        quantity_in_stock,
        expiry_date,
        description
      });

      res.status(201).json({ success: true, message: 'Dawa imehifadhiwa', data: { id } });
    } catch (error) {
      console.error('Create medicine error:', error);
      res.status(500).json({ success: false, message: 'Kuna hitilafu katika mfumo' });
    }
  },

  async update(req, res) {
    try {
      const { name, category, unit_price, quantity_in_stock, expiry_date, description } = req.body;
      const medicine = await Medicine.getById(req.params.id);
      if (!medicine) {
        return res.status(404).json({ success: false, message: 'Dawa haikupatikana' });
      }

      await Medicine.update(req.params.id, {
        name: name || medicine.name,
        category: category || medicine.category,
        unit_price: unit_price != null ? unit_price : medicine.unit_price,
        quantity_in_stock: quantity_in_stock != null ? quantity_in_stock : medicine.quantity_in_stock,
        expiry_date: expiry_date || medicine.expiry_date,
        description: description || medicine.description
      });

      res.json({ success: true, message: 'Dawa imebadilishwa' });
    } catch (error) {
      console.error('Update medicine error:', error);
      res.status(500).json({ success: false, message: 'Kuna hitilafu katika mfumo' });
    }
  },

  // Inventory management endpoints
  async getLowStock(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const medicines = await Medicine.getLowStock(limit);
      res.json({ success: true, data: medicines });
    } catch (error) {
      console.error('Get low stock error:', error);
      res.status(500).json({ success: false, message: 'Kuna hitilafu katika mfumo' });
    }
  },

  async getExpiringSoon(req, res) {
    try {
      const days = parseInt(req.query.days) || 30;
      const medicines = await Medicine.getExpiringSoon(days);
      res.json({ success: true, data: medicines });
    } catch (error) {
      console.error('Get expiring soon error:', error);
      res.status(500).json({ success: false, message: 'Kuna hitilafu katika mfumo' });
    }
  },

  async getExpired(req, res) {
    try {
      const medicines = await Medicine.getExpired();
      res.json({ success: true, data: medicines });
    } catch (error) {
      console.error('Get expired error:', error);
      res.status(500).json({ success: false, message: 'Kuna hitilafu katika mfumo' });
    }
  },

  async adjustStock(req, res) {
    try {
      const { adjustment, reason } = req.body;
      const medicineId = req.params.id;

      if (!adjustment || adjustment === 0) {
        return res.status(400).json({ success: false, message: 'Tafadhali toa kiasi cha marekebisho' });
      }

      const result = await Medicine.adjustStock(medicineId, parseInt(adjustment), reason, req.user.id);

      res.json({
        success: true,
        message: `Stock imerekebishwa: ${result.oldStock} → ${result.newStock}`,
        data: result
      });
    } catch (error) {
      console.error('Adjust stock error:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getInventorySummary(req, res) {
    try {
      const summary = await Medicine.getInventorySummary();
      res.json({ success: true, data: summary });
    } catch (error) {
      console.error('Get inventory summary error:', error);
      res.status(500).json({ success: false, message: 'Kuna hitilafu katika mfumo' });
    }
  },

  async getCategories(req, res) {
    try {
      const categories = await Medicine.getCategories();
      res.json({ success: true, data: categories });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ success: false, message: 'Kuna hitilafu katika mfumo' });
    }
  }
};

module.exports = MedicineController;
