import { fetchWithAuth } from '../auth/fetchWithAuth.js';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetchWithAuth(url, options);

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }
    return data;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Request failed');
  }

  return response;
}

export const api = {
  auth: {
    login: (credentials) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (userData) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    getMe: () => request('/auth/me'),
    logout: () => request('/auth/logout', { method: 'POST' }),
  },
  events: {
    getAll: (params = '') => request(`/events${params ? `?${params}` : ''}`),
    getBySlug: (slug) => request(`/events/${slug}`),
    create: (data) =>
      request('/events', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      request(`/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      request(`/events/${id}`, {
        method: 'DELETE',
      }),
  },
  registrations: {
    register: (data) =>
      request('/registrations', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getMy: () => request('/registrations/my'),
    getAttendees: (eventId) => request(`/registrations/event/${eventId}`),
    updateAttendance: (id, attended) =>
      request(`/registrations/${id}/attendance`, {
        method: 'PATCH',
        body: JSON.stringify({ attended }),
      }),
    exportCSV: (eventId) => `${API_BASE}/registrations/event/${eventId}/export`,
  },
  payments: {
    submitProof: (formData) =>
      request('/payments/submit-proof', {
        method: 'POST',
        body: formData,
      }),
    getAllAdmin: (status = 'PENDING') => request(`/payments/admin/all?status=${status}`),
    verify: (id, data) =>
      request(`/payments/admin/${id}/verify`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    getScreenshotUrl: (id) => `${API_BASE}/payments/screenshot/${id}`,
  },
  team: {
    getAll: () => request('/team'),
    create: (data) =>
      request('/team', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      request(`/team/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      request(`/team/${id}`, {
        method: 'DELETE',
      }),
    reorder: (orders) =>
      request('/team/reorder', {
        method: 'POST',
        body: JSON.stringify({ orders }),
      }),
    uploadPhoto: (formData) =>
      request('/team/upload-photo', {
        method: 'POST',
        body: formData,
      }),
    getDesignations: () => request('/team/designations'),
    createDesignation: (data) =>
      request('/team/designations', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateDesignation: (id, data) =>
      request(`/team/designations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    deleteDesignation: (id) =>
      request(`/team/designations/${id}`, {
        method: 'DELETE',
      }),
  },
  gallery: {
    getAlbums: () => request('/gallery/albums'),
    getAlbumBySlug: (slug) => request(`/gallery/albums/${slug}`),
    createAlbum: (data) =>
      request('/gallery/albums', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateAlbum: (id, data) =>
      request(`/gallery/albums/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    deleteAlbum: (id) =>
      request(`/gallery/albums/${id}`, {
        method: 'DELETE',
      }),
    addMedia: (data) =>
      request('/gallery/media', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    deleteMedia: (id) =>
      request(`/gallery/media/${id}`, {
        method: 'DELETE',
      }),
  },
  activities: {
    getAll: (params = '') => request(`/activities${params ? `?${params}` : ''}`),
    create: (data) =>
      request('/activities', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, data) =>
      request(`/activities/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id) =>
      request(`/activities/${id}`, {
        method: 'DELETE',
      }),
  },
  membership: {
    apply: (data) =>
      request('/applications', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getAll: (status = 'PENDING') => request(`/applications?status=${status}`),
    review: (id, data) =>
      request(`/applications/${id}/review`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },
  contact: {
    submit: (data) =>
      request('/contact', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getAll: () => request('/contact'),
    resolve: (id, isResolved) =>
      request(`/contact/${id}/resolve`, {
        method: 'PATCH',
        body: JSON.stringify({ isResolved }),
      }),
  },
  content: {
    get: (key) => request(`/content/${key}`),
    update: (key, data) =>
      request(`/content/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ data }),
      }),
    uploadImage: (formData) =>
      request('/content/upload-image', {
        method: 'POST',
        body: formData,
      }),
  },
  admin: {
    getStats: () => request('/admin/stats'),
    getUsers: () => request('/admin/users'),
    updateUserRole: (id, role) =>
      request(`/admin/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    deleteUser: (id) =>
      request(`/admin/users/${id}`, {
        method: 'DELETE',
      }),
  },
};

export default api;
