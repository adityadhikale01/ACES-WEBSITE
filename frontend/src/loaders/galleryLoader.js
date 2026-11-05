import { api } from '../services/api.js';

export async function galleryLoader() {
  try {
    console.log('Fetching gallery albums...');
    const res = await api.gallery.getAlbums();
    return { albums: res.albums || [] };
  } catch (error) {
    return { albums: [], error: error.message };
  }
}
