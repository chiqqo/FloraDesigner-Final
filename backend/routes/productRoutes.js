const express = require('express');
const router = express.Router();
const requireDatabase = require('../middleware/requireDatabase');
const requireAdmin = require('../middleware/requireAdmin');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

router.use(requireDatabase);

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', requireAdmin, createProduct);
router.put('/:id', requireAdmin, updateProduct);
router.delete('/:id', requireAdmin, deleteProduct);

module.exports = router;
