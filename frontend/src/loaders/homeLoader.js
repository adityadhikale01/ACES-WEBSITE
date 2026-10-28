import { api } from '../services/api.js';

export async function homeLoader() {
  try {
    const [eventsRes, brandingRes] = await Promise.all([
      api.events.getAll('status=PUBLISHED').catch(() => ({ events: [] })),
      api.content.get('branding').catch(() => ({ data: null })),
    ]);

    return {
      events: eventsRes?.events || [],
      branding: brandingRes?.data || null,
    };
  } catch (error) {
    return { events: [], branding: null, error: error.message };
  }
}
