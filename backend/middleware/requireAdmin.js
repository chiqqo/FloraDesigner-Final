const requireAdmin = (req, res, next) => {
  const expected = process.env.ADMIN_API_KEY;

  if (!expected) {
    console.warn('[requireAdmin] ADMIN_API_KEY not set in .env - admin routes are unprotected.');
    return next();
  }

  const provided = req.headers['x-admin-key'];
  if (!provided || provided !== expected) {
    return res.status(403).json({ message: 'Admin access required.' });
  }

  next();
};

module.exports = requireAdmin;
