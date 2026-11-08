import { api } from '../services/api.js';

export async function eventDetailLoader({ params }) {
  try {
    const res = await api.events.getBySlug(params.slug);
    console.log('eventDetailLoader res', res);
    return { event: res.event };
  } catch (error) {
    throw new Response('Event Not Found', { status: 404 });
    }
  }
