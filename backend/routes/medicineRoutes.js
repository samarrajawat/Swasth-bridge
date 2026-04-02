const express = require('express');
const router = express.Router();
const { getAllMedicines, getLowStockMedicines, addMedicine, updateMedicine, deleteMedicine } = require('../controllers/medicineController');
const { protect } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');

router.get('/', protect, getAllMedicines);
router.get('/low-stock', protect, roleGuard('admin'), getLowStockMedicines);
router.post('/', protect, roleGuard('admin'), addMedicine);
router.put('/:id', protect, roleGuard('admin'), updateMedicine);
router.delete('/:id', protect, roleGuard('admin'), deleteMedicine);

module.exports = router;
