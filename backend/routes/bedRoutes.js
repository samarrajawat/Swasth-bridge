const express = require('express');
const router = express.Router();
const { getAllBeds, updateBed, addBed } = require('../controllers/bedController');
const { protect } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');

router.get('/', protect, getAllBeds);
router.post('/', protect, roleGuard('admin'), addBed);
router.put('/:id', protect, roleGuard('admin'), updateBed);

module.exports = router;
