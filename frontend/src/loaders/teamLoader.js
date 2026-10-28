import { api } from '../services/api.js';

export async function teamLoader() {
  try {
    const [teamRes, brandingRes] = await Promise.all([
      api.team.getAll().catch(() => ({ members: [] })),
      api.content.get('branding').catch(() => ({ data: null })),
    ]);

    return {
      members: teamRes.members || [],
      branding: brandingRes.data || null,
    };
  } catch (error) {
    return { members: [], branding: null, error: error.message };
  }
}
