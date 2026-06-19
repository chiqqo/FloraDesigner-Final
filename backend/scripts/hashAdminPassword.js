const crypto = require('crypto');

const password = process.argv.slice(2).join(' ');

if (!password) {
  console.error('Usage: npm run hash-admin-password -- "your password"');
  process.exit(1);
}

const iterations = 120000;
const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512').toString('hex');

console.log(`pbkdf2-sha512$${iterations}$${salt}$${hash}`);
