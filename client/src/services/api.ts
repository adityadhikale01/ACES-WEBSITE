const API_BASE = '/api/v1';

export async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string; [key: string]: any }> {
  const url = `${API_BASE}${endpoint}`;

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const defaultHeaders: Record<string, string> = isFormData
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
    credentials: 'include', // Automatically passes HTTP-only cookies
  });

  let data: any = {};
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
    register: (body: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    logout: () => request('/auth/logout', { method: 'POST' }),
    me: () => request('/auth/me'),
    updateProfile: (body: any) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
  },

  // Events
  events: {
    getAll: (params?: { category?: string; status?: string; search?: string; featured?: boolean }) => {
      const q = new URLSearchParams();
      if (params?.category) q.append('category', params.category);
      if (params?.status) q.append('status', params.status);
      if (params?.search) q.append('search', params.search);
      if (params?.featured) q.append('featured', 'true');
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request(`/events${queryStr}`);
    },
    getBySlug: (slug: string) => request(`/events/${slug}`),
    create: (body: any) => request('/events', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: any) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request(`/events/${id}`, { method: 'DELETE' }),
  },

  // Registrations
  registrations: {
    register: (body: { eventId: string; phone?: string; academicYear?: string; notes?: string }) =>
      request('/registrations', { method: 'POST', body: JSON.stringify(body) }),
    cancel: (id: string) => request(`/registrations/${id}`, { method: 'DELETE' }),
    getMyRegistrations: () => request('/registrations/my'),
    getAttendees: (eventId: string) => request(`/registrations/event/${eventId}`),
    updateAttendance: (id: string, status: string) =>
      request(`/registrations/${id}/attendance`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    getExportUrl: (eventId: string) => `${API_BASE}/registrations/event/${eventId}/export`,
  },

  // Payments & Manual Verification
  payments: {
    submitProof: (formData: FormData) =>
      request('/payments/submit-proof', {
        method: 'POST',
        body: formData,
      }),
    getMyPayments: () => request('/payments/my'),
    getAdminQueue: (params?: { status?: string; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.status) q.append('status', params.status);
      if (params?.search) q.append('search', params.search);
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request(`/payments/admin/all${queryStr}`);
    },
    verifyProof: (id: string, body: { status: string; rejectionReason?: string; adminNotes?: string }) =>
      request(`/payments/admin/${id}/verify`, { method: 'PATCH', body: JSON.stringify(body) }),
    getScreenshotUrl: (id: string) => `${API_BASE}/payments/screenshot/${id}`,
  },

  // Designations
  designations: {
    getAll: () => request('/designations'),
    getAllAdmin: () => request('/designations/admin/all'),
    create: (body: any) => request('/designations', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: any) => request(`/designations/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    retire: (id: string) => request(`/designations/${id}`, { method: 'DELETE' }),
  },

  // Applications
  applications: {
    submit: (body: any) => request('/applications', { method: 'POST', body: JSON.stringify(body) }),
    getMyApplication: () => request('/applications/my'),
    getAll: (params?: { status?: string; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.status) q.append('status', params?.status);
      if (params?.search) q.append('search', params?.search);
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request(`/applications/all${queryStr}`);
    },
    review: (id: string, body: { status: 'APPROVED' | 'REJECTED'; adminNotes?: string }) =>
      request(`/applications/${id}/review`, { method: 'PATCH', body: JSON.stringify(body) }),
  },

  // Team
  team: {
    getAll: () => request('/team'),
    getAllAdmin: () => request('/team/admin/all'),
    add: (body: any) => request('/team', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: any) => request(`/team/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request(`/team/${id}`, { method: 'DELETE' }),
    reorder: (orderedIds: string[]) =>
      request('/team/reorder', { method: 'PATCH', body: JSON.stringify({ orderedIds }) }),
    uploadPhoto: (formData: FormData) =>
      request('/team/upload-photo', { method: 'POST', body: formData }),
  },

  // Activities
  activities: {
    getAll: (type?: string) => request(`/activities${type ? `?type=${type}` : ''}`),
    create: (body: any) => request('/activities', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: any) => request(`/activities/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request(`/activities/${id}`, { method: 'DELETE' }),
  },

  // Gallery (Albums & Media)
  gallery: {
    getAlbums: (category?: string) =>
      request(`/gallery/albums${category ? `?category=${category}` : ''}`),
    getAlbumById: (id: string) => request(`/gallery/albums/${id}`),
    getAllAlbumsAdmin: () => request('/gallery/admin/all'),
    createAlbum: (body: any) => request('/gallery/albums', { method: 'POST', body: JSON.stringify(body) }),
    updateAlbum: (id: string, body: any) =>
      request(`/gallery/albums/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteAlbum: (id: string) => request(`/gallery/albums/${id}`, { method: 'DELETE' }),
    uploadMedia: (albumId: string, formData: FormData) =>
      request(`/gallery/albums/${albumId}/media`, {
        method: 'POST',
        body: formData,
      }),
    deleteMedia: (albumId: string, mediaId: string) =>
      request(`/gallery/albums/${albumId}/media/${mediaId}`, { method: 'DELETE' }),
    getAllLegacy: (category?: string) =>
      request(`/gallery/legacy${category ? `?category=${category}` : ''}`),
  },

  // Contact
  contact: {
    submit: (body: any) => request('/contact', { method: 'POST', body: JSON.stringify(body) }),
    getAll: () => request('/contact'),
    markRead: (id: string, isRead: boolean) =>
      request(`/contact/${id}`, { method: 'PATCH', body: JSON.stringify({ isRead }) }),
  },

  // Content CMS
  content: {
    get: (key: string) => request(`/content/${key}`),
    update: (key: string, data: any) => request(`/content/${key}`, { method: 'PUT', body: JSON.stringify({ data }) }),
    uploadImage: (formData: FormData) =>
      request('/content/upload-image', { method: 'POST', body: formData }),
  },

  // Admin
  admin: {
    getStats: () => request('/admin/stats'),
    getUsers: (params?: { role?: string; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.role) q.append('role', params?.role);
      if (params?.search) q.append('search', params?.search);
      const queryStr = q.toString() ? `?${q.toString()}` : '';
      return request(`/admin/users${queryStr}`);
    },
    updateUser: (id: string, body: any) => request(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  },
};
