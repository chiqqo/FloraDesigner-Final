const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

router.get('/', (req, res) => {
  // readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  const database = mongoose.connection.readyState === 1 ? 'connected' : 'offline';
  res.json({
    status: 'ok',
    message: 'FloraDesigner API is running',
    database,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
