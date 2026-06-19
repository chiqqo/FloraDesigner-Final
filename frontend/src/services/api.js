const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

function adminHeaders(includeContentType = true) {
  const expiresAt = Number(sessionStorage.getItem('floradesigner_admin_expires_at') || 0);
  const key = expiresAt && expiresAt <= Date.now()
    ? ''
    : sessionStorage.getItem('floradesigner_admin_key') || '';

  if (!key && expiresAt) {
    sessionStorage.removeItem('floradesigner_admin_key');
    sessionStorage.removeItem('floradesigner_admin_user');
    sessionStorage.removeItem('floradesigner_admin_expires_at');
  }

  const headers = includeContentType ? { 'Content-Type': 'application/json' } : {};
  if (key) headers['X-Admin-Key'] = key;
  return headers;
}

export async function getProducts() {
  const res = await fetch(`${API_BASE_URL}/products`);
  if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
  return res.json();
}

export async function getProductById(id) {
  const res = await fetch(`${API_BASE_URL}/products/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch product: ${res.status}`);
  return res.json();
}

export async function createOrder(order) {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
  if (!res.ok) throw new Error(`Failed to create order: ${res.status}`);
  return res.json();
}

export async function getOrders() {
  const res = await fetch(`${API_BASE_URL}/orders`);
  if (!res.ok) throw new Error(`Failed to fetch orders: ${res.status}`);
  return res.json();
}

export async function updateOrderStatus(orderId, status) {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`Failed to update order status: ${res.status}`);
  return res.json();
}

export async function getGeneratedDesigns() {
  const res = await fetch(`${API_BASE_URL}/designer/designs`);
  if (!res.ok) throw new Error(`Failed to fetch designs: ${res.status}`);
  return res.json();
}

export async function generateDesign(formData) {
  const res = await fetch(`${API_BASE_URL}/designer/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  if (!res.ok) throw new Error(`Failed to generate design: ${res.status}`);
  return res.json();
}

export async function saveDesign(designData) {
  const res = await fetch(`${API_BASE_URL}/designer/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(designData),
  });
  if (!res.ok) throw new Error(`Failed to save design: ${res.status}`);
  return res.json();
}

export async function createProduct(productData) {
  const res = await fetch(`${API_BASE_URL}/products`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(productData),
  });
  if (!res.ok) throw new Error(`Failed to create product: ${res.status}`);
  return res.json();
}

export async function updateProduct(productId, productData) {
  const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify(productData),
  });
  if (!res.ok) throw new Error(`Failed to update product: ${res.status}`);
  return res.json();
}

export async function deleteProduct(productId) {
  const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: 'DELETE',
    headers: adminHeaders(false),
  });
  if (!res.ok) throw new Error(`Failed to delete product: ${res.status}`);
  return res.json();
}

export async function createContactMessage(messageData) {
  const res = await fetch(`${API_BASE_URL}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messageData),
  });
  if (!res.ok) throw new Error(`Failed to send message: ${res.status}`);
  return res.json();
}

export async function getContactMessages() {
  const res = await fetch(`${API_BASE_URL}/contact`, {
    headers: adminHeaders(false),
  });
  if (!res.ok) throw new Error(`Failed to fetch messages: ${res.status}`);
  return res.json();
}

export async function adminLogin(credentials) {
  const res = await fetch(`${API_BASE_URL}/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  return res.json();
}
