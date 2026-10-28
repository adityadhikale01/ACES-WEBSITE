import { getAccessToken, saveAccessToken, clearAuth } from './authStorage.js';

export async function fetchWithAuth(url, options = {}) {
  const token = getAccessToken();
  const headers = {
    ...options.headers,
  };

  // Do not set Content-Type if FormData is used
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
    credentials: 'include',
  };

  let response = await fetch(url, config);

  if (response.status === 401) {
    try {
      const refreshRes = await fetch('/api/v1/auth/refresh', {
        method: 'GET',
        credentials: 'include',
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (refreshData.token) {
          saveAccessToken(refreshData.token);
          config.headers['Authorization'] = `Bearer ${refreshData.token}`;
          response = await fetch(url, config);
        }
      } else {
        clearAuth();
      }
    } catch {
      clearAuth();
    }
  }

  return response;
}
