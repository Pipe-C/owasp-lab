const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Token CSRF double-submit (ver backend/src/middleware/csrf.js). Se guarda
// en memoria tras el login y se repite en el encabezado X-CSRF-Token en las
// peticiones que modifican estado, para que el modo parcheado lo valide.
let csrfToken = null;
export function setCsrfToken(token) {
  csrfToken = token;
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (csrfToken && method !== 'GET') headers['X-CSRF-Token'] = csrfToken;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Error ${res.status}`);
    err.status = res.status;
    err.detail = data.detail;
    throw err;
  }
  return data;
}

export const api = {
  health: () => request('/api/health'),
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: { email, password } }),
  me: () => request('/api/auth/me'),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  invoices: () => request('/api/invoices'),
  invoice: (id) => request(`/api/invoices/${id}`),
  addNote: (id, bodyText) => request(`/api/invoices/${id}/notes`, { method: 'POST', body: { body: bodyText } }),
  updateProfile: (fields) => request('/api/users/profile', { method: 'PUT', body: fields }),
  search: (q) => request(`/api/search?q=${encodeURIComponent(q)}`),
  fetchLogo: (url) => request('/api/webhooks/fetch-logo', { method: 'POST', body: { url } }),
  webhookCalls: () => request('/api/webhooks/calls'),
};
