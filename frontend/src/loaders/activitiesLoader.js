import { api } from '../services/api.js';

export async function activitiesLoader() {
  try {
    const res = await api.activities.getAll();
    return { items: res.items || [] };
  } catch (error) {
    return { items: [], error: error.message };
  }
}
