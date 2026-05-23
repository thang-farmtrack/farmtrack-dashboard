export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('farmtrack_token');
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  try {
    const u = localStorage.getItem('farmtrack_user');
    return u ? JSON.parse(u) : null;
  } catch { return null; }
}

export function setAuth(token, user) {
  localStorage.setItem('farmtrack_token', token);
  localStorage.setItem('farmtrack_user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('farmtrack_token');
  localStorage.removeItem('farmtrack_user');
}

export function isAuthenticated() {
  return !!getToken();
}
