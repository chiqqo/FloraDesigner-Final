const express = require('express');
const router = express.Router();
const requireDatabase = require('../middleware/requireDatabase');
const requireAdmin = require('../middleware/requireAdmin');
const { createContactMessage, getContactMessages } = require('../controllers/contactController');

router.use(requireDatabase);

router.post('/', createContactMessage);
router.get('/', requireAdmin, getContactMessages);

module.exports = router;
