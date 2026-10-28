export function getAccessToken() {
  return localStorage.getItem('accessToken');
}

export function saveAccessToken(token) {
  if (token) {
    localStorage.setItem('accessToken', token);
  }
}

export function getUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveUser(user) {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
}

export function clearAuth() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
}
