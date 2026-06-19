const crypto = require('crypto');

const TOKEN_TTL_MS = 2 * 60 * 60 * 1000;

function getTokenSecret() {
  return process.env.ADMIN_TOKEN_SECRET || process.env.ADMIN_API_KEY;
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
}

function verifyPassword(password) {
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (expectedHash) {
    const [algorithm, iterations, salt, storedHash] = expectedHash.split('$');
    if (algorithm !== 'pbkdf2-sha512' || !iterations || !salt || !storedHash) {
      throw new Error('ADMIN_PASSWORD_HASH is not in the expected format.');
    }

    const computed = crypto
      .pbkdf2Sync(password, salt, Number(iterations), 64, 'sha512')
      .toString('hex');

    const computedBuffer = Buffer.from(computed, 'hex');
    const storedBuffer = Buffer.from(storedHash, 'hex');

    return (
      computedBuffer.length === storedBuffer.length &&
      crypto.timingSafeEqual(computedBuffer, storedBuffer)
    );
  }

  if (!expectedPassword) return false;

  return crypto.timingSafeEqual(
    Buffer.from(hashPassword(password, 'legacy-admin-salt'), 'hex'),
    Buffer.from(hashPassword(expectedPassword, 'legacy-admin-salt'), 'hex')
  );
}

function createAdminToken(username) {
  const expiresAt = Date.now() + TOKEN_TTL_MS;
  const payload = Buffer.from(JSON.stringify({ username, expiresAt })).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getTokenSecret())
    .update(payload)
    .digest('base64url');

  return {
    token: `${payload}.${signature}`,
    expiresAt,
  };
}

const adminLogin = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  const expectedUsername = process.env.ADMIN_USERNAME;
  const tokenSecret = getTokenSecret();

  if (!expectedUsername || !tokenSecret || (!process.env.ADMIN_PASSWORD && !process.env.ADMIN_PASSWORD_HASH)) {
    return res.status(500).json({ message: 'Admin credentials not configured on the server.' });
  }

  let passwordOk = false;
  try {
    passwordOk = verifyPassword(password);
  } catch (err) {
    console.error(`[auth] ${err.message}`);
    return res.status(500).json({ message: 'Admin credentials are misconfigured on the server.' });
  }

  if (username !== expectedUsername || !passwordOk) {
    return res.status(401).json({ message: 'Invalid admin credentials.' });
  }

  const session = createAdminToken(expectedUsername);

  console.log(`[auth] Admin login successful for "${expectedUsername}"`);
  res.json({ token: session.token, username: expectedUsername, expiresAt: session.expiresAt });
};

module.exports = { adminLogin };
