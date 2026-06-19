/**
 * FloraDesigner backend smoke test.
 * Requires the backend server to be running on PORT (default 5000).
 * Reads admin credentials from .env so no secrets are hardcoded here.
 *
 * Usage:  npm run smoke   (from the backend folder)
 *
 * Note: start (or restart) the backend before running so it loads the
 * latest code and holds a fresh MongoDB Atlas connection.
 */

const http = require('http');
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 5000;
const BASE = `http://localhost:${PORT}/api`;

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

let passed = 0;
let failed = 0;

// ─── helpers ────────────────────────────────────────────────────────────────

function request(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: PORT,
      path: `/api${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...headers,
      },
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function pass(label, detail = '') {
  passed++;
  console.log(`  PASS  ${label}${detail ? ' — ' + detail : ''}`);
}

function fail(label, detail = '') {
  failed++;
  console.error(`  FAIL  ${label}${detail ? ' — ' + detail : ''}`);
}

function skip(label, reason = '') {
  console.log(`  SKIP  ${label}${reason ? ' — ' + reason : ''}`);
}

function section(title) {
  console.log(`\n── ${title}`);
}

function dbUnavailable(status, body) {
  return status === 503 || (status === 500 && String(body?.message).includes('offline'));
}

// ─── tests ──────────────────────────────────────────────────────────────────

async function testHealth() {
  section('GET /api/health');
  const r = await request('GET', '/health');
  r.status === 200 && r.body.status === 'ok'
    ? pass('Status 200, status:"ok"', `database: ${r.body.database}`)
    : fail('Expected 200 status:"ok"', `got ${r.status} ${JSON.stringify(r.body)}`);
  r.body.database === 'connected'
    ? pass('MongoDB connected')
    : fail('MongoDB not connected — restart the backend to get a fresh Atlas connection', `database: "${r.body.database}"`);
  return r.body.database === 'connected';
}

async function testGetProducts(dbOk) {
  section('GET /api/products');
  if (!dbOk) { skip('Skipped', 'MongoDB not connected'); return null; }
  const r = await request('GET', '/products');
  if (dbUnavailable(r.status, r.body)) {
    fail('Database unavailable during request — restart the backend', `${r.status}`);
    return null;
  }
  if (r.status !== 200) { fail('Expected 200', `got ${r.status} ${JSON.stringify(r.body)}`); return null; }
  const arr = Array.isArray(r.body) ? r.body : [];
  arr.length === 8
    ? pass(`Returned exactly 8 products`)
    : fail(`Expected exactly 8 products`, `got ${arr.length} — run: cd backend && npm run seed, then restart the backend`);
  const prices = arr.map((p) => p.price);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  (minP >= 60 && maxP <= 200)
    ? pass('All prices in GEL range', `min ₾${minP}, max ₾${maxP}`)
    : fail('Price outside GEL range 60–200', `min ${minP}, max ${maxP}`);
  return arr;
}

async function testAdminLogin() {
  section('POST /api/auth/admin/login');

  const good = await request('POST', '/auth/admin/login', {
    username: ADMIN_USERNAME,
    password: ADMIN_PASSWORD,
  });
  if (
    good.status === 200 &&
    good.body.token &&
    good.body.token.includes('.') &&
    Number(good.body.expiresAt) > Date.now()
  ) {
    pass('Correct credentials accepted', 'signed token received');
  } else {
    fail('Correct credentials rejected', `got ${good.status} ${JSON.stringify(good.body)}`);
  }

  const bad = await request('POST', '/auth/admin/login', {
    username: 'wrong',
    password: 'wrong',
  });
  bad.status === 401
    ? pass('Wrong credentials rejected with 401')
    : fail('Expected 401 for wrong credentials', `got ${bad.status}`);

  return good.body.token || null;
}

async function testPostContact(dbOk) {
  section('POST /api/contact');
  if (!dbOk) { skip('Skipped', 'MongoDB not connected'); return; }

  const r = await request('POST', '/contact', {
    name: 'Smoke Test User',
    email: 'smoketest@floradesigner.local',
    message: 'Automated smoke test message — safe to ignore.',
  });
  if (dbUnavailable(r.status, r.body)) {
    fail('Database unavailable — restart the backend for a fresh connection', `${r.status}`);
    return;
  }
  r.status === 201 && r.body._id
    ? pass('Contact message created', `_id: ${r.body._id}`)
    : fail('Expected 201 with _id', `got ${r.status} ${JSON.stringify(r.body)}`);

  const bad = await request('POST', '/contact', { name: 'X', email: '' });
  // allow 400 (validation error) or 503 (db offline mid-test)
  bad.status === 400
    ? pass('Missing email rejected with 400')
    : bad.status === 503
    ? skip('Missing-email validation check', 'DB went offline mid-test')
    : fail('Expected 400 for missing email', `got ${bad.status}`);
}

async function testPostOrder(dbOk) {
  section('POST /api/orders');
  if (!dbOk) { skip('Skipped', 'MongoDB not connected'); return null; }

  const r = await request('POST', '/orders', {
    customerName: 'Smoke Test Customer',
    phone: '+995 555 000 001',
    address: 'Tbilisi, Test Street 1',
    deliveryDate: '2026-12-01',
    deliveryTime: '10:00 - 12:00',
    paymentMethod: 'Cash on Delivery',
    note: 'Smoke test order — safe to delete.',
    totalPrice: 120,
    orderType: 'ready-made',
    items: [
      {
        id: 'smoke-test-item-1',
        name: 'Rose Romance',
        price: 120,
        quantity: 1,
        category: 'Romantic',
        itemType: 'ready-made',
        imageUrl: '',
      },
    ],
  });
  if (dbUnavailable(r.status, r.body)) {
    fail('Database unavailable — restart the backend for a fresh connection', `${r.status}`);
    return null;
  }
  if (r.status === 201 && r.body._id) {
    pass('Order created', `_id: ${r.body._id}, status: ${r.body.status}`);
    return r.body._id;
  }
  fail('Expected 201 with _id', `got ${r.status} ${JSON.stringify(r.body)}`);
  return null;
}

async function testUpdateOrderStatus(orderId, adminToken) {
  section('PUT /api/orders/:id/status');
  if (!orderId) { skip('Skipped', 'no orderId from POST /orders test'); return; }
  if (!adminToken) { skip('Skipped', 'no admin token from login test'); return; }

  const r = await request(
    'PUT',
    `/orders/${orderId}/status`,
    { status: 'Preparing' },
    { 'X-Admin-Key': adminToken }
  );
  r.status === 200 && r.body.status === 'Preparing'
    ? pass('Order status updated to Preparing')
    : fail('Expected 200 status:"Preparing"', `got ${r.status} ${JSON.stringify(r.body)}`);

  const unauth = await request('PUT', `/orders/${orderId}/status`, { status: 'Ready' });
  unauth.status === 403
    ? pass('Request without X-Admin-Key rejected with 403')
    : fail('Expected 403 for missing X-Admin-Key', `got ${unauth.status}`);

  const forged = await request(
    'PUT',
    `/orders/${orderId}/status`,
    { status: 'Ready' },
    { 'X-Admin-Key': 'invalid.token.value' }
  );
  forged.status === 403
    ? pass('Forged admin token rejected with 403')
    : fail('Expected 403 for forged admin token', `got ${forged.status}`);
}

async function testDesignerGenerate() {
  section('POST /api/designer/generate');
  // This endpoint works without MongoDB (no DB call in the handler).
  const r = await request('POST', '/designer/generate', {
    occasion: 'Birthday',
    style: 'Romantic',
    preferredFlowers: ['Roses', 'Peonies'],
    preferredColors: ['Pink', 'White'],
    bouquetSize: 'Medium',
    wrappingStyle: 'Kraft paper',
    description: 'Smoke test bouquet.',
  });

  if (r.status !== 200) {
    fail('Expected 200', `got ${r.status} ${JSON.stringify(r.body)}`);
    return;
  }

  // prompt
  r.body.prompt
    ? pass('Response contains prompt', r.body.prompt.slice(0, 70) + '…')
    : fail('Response missing "prompt" field');

  // generatedImages (actual field name in the controller)
  Array.isArray(r.body.generatedImages) && r.body.generatedImages.length > 0
    ? pass(`Response contains ${r.body.generatedImages.length} image(s) in "generatedImages"`)
    : fail('Response missing "generatedImages" array or it is empty');

  // estimatedPrice — must be a whole GEL number in range 60–200
  const ep = r.body.estimatedPrice;
  typeof ep === 'number' && ep >= 60 && ep <= 200
    ? pass(`estimatedPrice ₾${ep} (in GEL range 60–200)`)
    : fail(
        'estimatedPrice missing or outside GEL range 60–200',
        `got ${ep} — ensure backend is restarted so the latest estimatePrice() is in effect`
      );

  // provider field ("gemini" or "simulated")
  r.body.provider === 'gemini' || r.body.provider === 'simulated'
    ? pass(`provider: "${r.body.provider}"`)
    : fail('Response missing or unexpected "provider" field', `got ${JSON.stringify(r.body.provider)}`);
}

// ─── main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nFloraDesigner Smoke Test`);
  console.log(`Target: ${BASE}`);
  console.log(`Admin user from .env: "${ADMIN_USERNAME}"`);
  console.log('─'.repeat(55));
  console.log('  Tip: restart the backend before running to ensure');
  console.log('  latest code and a fresh MongoDB Atlas connection.');

  try {
    const dbOk = await testHealth();
    await testGetProducts(dbOk);
    const token = await testAdminLogin();
    await testPostContact(dbOk);
    const orderId = await testPostOrder(dbOk);
    await testUpdateOrderStatus(orderId, token);
    await testDesignerGenerate();
  } catch (err) {
    failed++;
    console.error(`\n  FAIL  Unexpected error: ${err.message}`);
    console.error('         Is the backend running on port', PORT, '?');
  }

  console.log('\n' + '─'.repeat(55));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed === 0) {
    console.log('All checks passed. Backend is ready for demo.\n');
  } else {
    console.log('Some checks failed. See output above.\n');
    process.exit(1);
  }
}

main();
