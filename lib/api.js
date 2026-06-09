const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://farmtrack-api-production-2e37.up.railway.app';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('farmtrack_token');
}

async function request(method, path, body = null) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || 'Lỗi không xác định');
  return data;
}

export const api = {
  get:    (path)        => request('GET',    path),
  post:   (path, body)  => request('POST',   path, body),
  put:    (path, body)  => request('PUT',    path, body),
  delete: (path)        => request('DELETE', path),
};

// Auth
export const authApi = {
  login: (phone, password) => api.post('/api/auth/login', { phone, password }),
};

// Flocks
export const flocksApi = {
  getAll:  ()       => api.get('/api/flocks'),
  create:  (data)   => api.post('/api/flocks', data),
  update:  (id, d)  => api.put(`/api/flocks/${id}`, d),
  delete:  (id)     => api.delete(`/api/flocks/${id}`),
};

// Houses
export const housesApi = {
  getAll: () => api.get('/api/houses'),
};

// Daily records
export const dailyApi = {
  getAll:  ()     => api.get('/api/daily'),
  create:  (data) => api.post('/api/daily', data),
};

// KPI
export const kpiApi = {
  get: () => api.get('/api/kpi'),
};

// Users (admin)
export const usersApi = {
  getAll:  ()       => api.get('/api/users'),
  create:  (data)   => api.post('/api/users', data),
  delete:  (id)     => api.delete(`/api/users/${id}`),
};

// Houses - extended
export const housesApiExt = {
  getAll:  ()     => api.get('/api/houses'),
  create:  (data) => api.post('/api/houses', data),
  update:  (id,d) => api.put(`/api/houses/${id}`, d),
  delete:  (id)   => api.delete(`/api/houses/${id}`),
};

// Feed transactions
export const feedApi = {
  getAll: () => api.get('/api/feed'),
  create: (data) => api.post('/api/feed', data),
};
