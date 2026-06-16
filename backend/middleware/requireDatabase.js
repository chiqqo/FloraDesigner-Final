const mongoose = require('mongoose');

function requireDatabase(req, res, next) {
  if (mongoose.connection.readyState === 1) {
    return next();
  }
  return res.status(503).json({
    message: 'Database unavailable. Running in offline demo mode.',
    database: 'offline',
  });
}

module.exports = requireDatabase;
