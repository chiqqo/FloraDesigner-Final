const adminLogin = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const token = process.env.ADMIN_API_KEY;

  if (!expectedUsername || !expectedPassword || !token) {
    return res.status(500).json({ message: 'Admin credentials not configured on the server.' });
  }

  if (username !== expectedUsername || password !== expectedPassword) {
    return res.status(401).json({ message: 'Invalid admin credentials.' });
  }

  console.log(`[auth] Admin login successful for "${expectedUsername}"`);
  res.json({ token, username: expectedUsername });
};

module.exports = { adminLogin };
