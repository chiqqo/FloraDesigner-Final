const express = require('express');
const router = express.Router();
const requireDatabase = require('../middleware/requireDatabase');
const {
  generateDesigns,
  saveSelectedDesign,
  getGeneratedDesigns,
  getGeneratedDesignById,
} = require('../controllers/generatedDesignController');

router.post('/generate', generateDesigns);
router.post('/save', requireDatabase, saveSelectedDesign);
router.get('/designs', requireDatabase, getGeneratedDesigns);
router.get('/designs/:id', requireDatabase, getGeneratedDesignById);

module.exports = router;
