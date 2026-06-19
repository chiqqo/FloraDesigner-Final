const crypto = require('crypto');

function getTokenSecret() {
  return process.env.ADMIN_TOKEN_SECRET || process.env.ADMIN_API_KEY;
}

function verifySignedToken(token) {
  const secret = getTokenSecret();
  if (!secret || !token || !token.includes('.')) return false;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('base64url');

  if (
    expected.length !== signature.length ||
    !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  ) {
    return false;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return decoded.username === process.env.ADMIN_USERNAME && Number(decoded.expiresAt) > Date.now();
  } catch {
    return false;
  }
}

const requireAdmin = (req, res, next) => {
  const expected = process.env.ADMIN_API_KEY;
  const tokenSecret = getTokenSecret();

  if (!tokenSecret) {
    console.error('[requireAdmin] Admin token secret is not configured.');
    return res.status(500).json({ message: 'Admin access is not configured on the server.' });
  }

  const provided = req.headers['x-admin-key'];

  if (!provided) {
    return res.status(403).json({ message: 'Admin access required.' });
  }

  const signedTokenOk = verifySignedToken(provided);
  const legacyTokenOk =
    expected &&
    provided === expected &&
    process.env.ALLOW_LEGACY_ADMIN_KEY === 'true';

  if (!signedTokenOk && !legacyTokenOk) {
    return res.status(403).json({ message: 'Admin access required.' });
  }

  next();
};

module.exports = requireAdmin;
