const express = require('express');
const router = express.Router();
const requireDatabase = require('../middleware/requireDatabase');
const requireAdmin = require('../middleware/requireAdmin');
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/orderController');

router.use(requireDatabase);

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.put('/:id/status', requireAdmin, updateOrderStatus);

module.exports = router;
