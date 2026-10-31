const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

export async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const defaultHeaders = isFormData
    ? {}
    : {
        'Content-Type': 'application/json',
      };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
    credentials: 'include',
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  auth: {
    register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    me: () => request('/auth/me'),
    updateProfile: (body) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
    uploadProfilePhoto: (formData) => request('/auth/profile-photo', { method: 'POST', body: formData }),
    changePassword: (body) => request('/auth/change-password', { method: 'PUT', body: JSON.stringify(body) }),
  },

  // Events
  events: {
    getAll: (params) => {
      if (typeof params === 'string') {
        return request(`/events${params ? (params.startsWith('?') ? params : `?${params}`) : ''}`);
      }
      const q = new URLSearchParams();
      if (params?.category) q.append('category', params.category);
      if (params?.status) q.append('status', params.status);
      if (params?.search) q.append('search', params.search);
      if (params?.featured) q.append('featured', 'true');
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request(`/events${queryStr}`);
    },
    getBySlug: (slug) => request(`/events/${slug}`),
    create: (body) => request('/events', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id) => request(`/events/${id}`, { method: 'DELETE' }),
  },

  // Registrations
  registrations: {
    register: (body) => {
      const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
      return request('/registrations', {
        method: 'POST',
        body: isForm ? body : JSON.stringify(body),
      });
    },
    cancel: (id) => request(`/registrations/${id}`, { method: 'DELETE' }),
    getMyRegistrations: () => request('/registrations/my'),
    getAttendees: (eventId) => request(`/registrations/event/${eventId}`),
    updateAttendance: (id, status) =>
      request(`/registrations/${id}/attendance`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    markAttendance: (id, attended) =>
      request(`/registrations/${id}/attendance`, { method: 'PATCH', body: JSON.stringify({ attended }) }),
    getExportUrl: (eventId) => `${API_BASE}/registrations/event/${eventId}/export`,
  },

  // Payments & Manual Verification
  payments: {
    submitProof: (formData) =>
      request('/payments/submit-proof', {
        method: 'POST',
        body: formData,
      }),
    getMyPayments: () => request('/payments/my'),
    getAdminQueue: (params) => {
      const q = new URLSearchParams();
      if (params?.status) q.append('status', params.status);
      if (params?.search) q.append('search', params.search);
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request(`/payments/admin/all${queryStr}`);
    },
    verifyProof: (id, body) =>
      request(`/payments/admin/${id}/verify`, { method: 'PATCH', body: JSON.stringify(body) }),
    getScreenshotUrl: (id) => `${API_BASE}/payments/screenshot/${id}`,
  },

  // Designations
  designations: {
    getAll: () => request('/designations'),
    getAllAdmin: () => request('/designations/admin/all'),
    create: (body) => request('/designations', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/designations/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    retire: (id) => request(`/designations/${id}`, { method: 'DELETE' }),
  },

  // Applications
  applications: {
    sendOtp: (body) => request('/applications/send-otp', { method: 'POST', body: JSON.stringify(body) }),
    verifyOtp: (body) => request('/applications/verify-otp', { method: 'POST', body: JSON.stringify(body) }),
    submit: (body) => request('/applications', { method: 'POST', body: JSON.stringify(body) }),
    getMyApplication: () => request('/applications/my'),
    getAll: (params) => {
      const q = new URLSearchParams();
      if (params?.status) q.append('status', params?.status);
      if (params?.search) q.append('search', params?.search);
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request(`/applications/all${queryStr}`);
    },
    review: (id, body) =>
      request(`/applications/${id}/review`, { method: 'PATCH', body: JSON.stringify(body) }),
    exportCSVUrl: `${API_BASE}/applications/export`,
  },

  // Team
  team: {
    getAll: () => request('/team'),
    getAllAdmin: () => request('/team/admin/all'),
    add: (body) => request('/team', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/team/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id) => request(`/team/${id}`, { method: 'DELETE' }),
    reorder: (orderedIds) =>
      request('/team/reorder', { method: 'PATCH', body: JSON.stringify({ orderedIds }) }),
    uploadPhoto: (formData) =>
      request('/team/upload-photo', { method: 'POST', body: formData }),
    assignPost: (id, body) =>
      request(`/team/assign-post/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  },

  // Activities
  activities: {
    getAll: (type) => request(`/activities${type ? `?type=${type}` : ''}`),
    create: (body) => request('/activities', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/activities/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id) => request(`/activities/${id}`, { method: 'DELETE' }),
  },

  // Gallery (Albums & Media)
  gallery: {
    getAlbums: (category) =>
      request(`/gallery/albums${category ? `?category=${category}` : ''}`),
    getAlbumById: (id) => request(`/gallery/albums/${id}`),
    getAllAlbumsAdmin: () => request('/gallery/admin/all'),
    createAlbum: (body) => request('/gallery/albums', { method: 'POST', body: JSON.stringify(body) }),
    updateAlbum: (id, body) =>
      request(`/gallery/albums/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteAlbum: (id) => request(`/gallery/albums/${id}`, { method: 'DELETE' }),
    uploadMedia: (albumId, formData) =>
      request(`/gallery/albums/${albumId}/media`, {
        method: 'POST',
        body: formData,
      }),
    deleteMedia: (albumId, mediaId) =>
      request(`/gallery/albums/${albumId}/media/${mediaId}`, { method: 'DELETE' }),
    getAllLegacy: (category) =>
      request(`/gallery/legacy${category ? `?category=${category}` : ''}`),
  },

  // Contact
  contact: {
    submit: (body) => request('/contact', { method: 'POST', body: JSON.stringify(body) }),
    getAll: () => request('/contact'),
    markRead: (id, isRead) =>
      request(`/contact/${id}`, { method: 'PATCH', body: JSON.stringify({ isRead }) }),
  },

  // Content CMS
  content: {
    get: (key) => request(`/content/${key}`),
    update: (key, data) => request(`/content/${key}`, { method: 'PUT', body: JSON.stringify({ data }) }),
    uploadImage: (formData) =>
      request('/content/upload-image', { method: 'POST', body: formData }),
    sendTestEmail: (body) =>
      request('/content/send-test-email', { method: 'POST', body: JSON.stringify(body) }),
  },

  // Admin
  admin: {
    getStats: () => request('/admin/stats'),
    getUsers: (params) => {
      const q = new URLSearchParams();
      if (params?.role) q.append('role', params?.role);
      if (params?.search) q.append('search', params?.search);
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request(`/admin/users${queryStr}`);
    },
    updateUser: (id, body) => request(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  },
};

export default api;
