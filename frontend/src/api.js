export const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

async function request(path, { token, method = 'GET', body, isFormData = false } = {}) {
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (body && !isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export function registerUser(payload) {
  return request('/auth/register', { method: 'POST', body: payload });
}

export function loginUser(payload) {
  return request('/auth/login', { method: 'POST', body: payload });
}

export function getMyRequests(token) {
  return request('/requests/mine', { token });
}

export function getAllRequests(token) {
  return request('/requests/all', { token });
}

export function createRequest(token, payload) {
  return request('/requests', { token, method: 'POST', body: payload, isFormData: true });
}

export function updateRequest(token, id, payload) {
  return request(`/requests/${id}`, { token, method: 'PUT', body: payload });
}

export function deleteRequest(token, id) {
  return request(`/requests/${id}`, { token, method: 'DELETE' });
}
