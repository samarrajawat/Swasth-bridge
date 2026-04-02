const express = require('express');
const router = express.Router();
const { getQueue, getMyQueuePosition } = require('../controllers/queueController');
const { protect } = require('../middleware/auth');

router.get('/:doctorId', protect, getQueue);
router.get('/:doctorId/position', protect, getMyQueuePosition);

module.exports = router;
