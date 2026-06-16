const express = require('express');
const router = express.Router();

const healthRoute = require('./healthRoute');
const productRoutes = require('./productRoutes');
const orderRoutes = require('./orderRoutes');
const generatedDesignRoutes = require('./generatedDesignRoutes');
const contactRoutes = require('./contactRoutes');
const authRoutes = require('./authRoutes');

router.use('/health', healthRoute);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/designer', generatedDesignRoutes);
router.use('/contact', contactRoutes);
router.use('/auth', authRoutes);

module.exports = router;
