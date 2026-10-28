import { api } from '../services/api.js';

export async function eventsLoader({ request }) {
  const url = new URL(request.url);
  const searchParams = url.searchParams.toString();
  try {
    const res = await api.events.getAll(searchParams);
    return { events: res.events || [] };
  } catch (error) {
    return { events: [], error: error.message };
  }
}
