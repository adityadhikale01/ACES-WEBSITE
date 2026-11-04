import { api } from '../services/api.js';

export async function adminLoader() {
  try {
    console.log('Fetching admin stats...');
    const res = await api.admin.getStats();
    return {
      stats: res.stats || {},
      recentRegistrations: res.recentRegistrations || [],
      pendingPaymentQueue: res.pendingPaymentQueue || [],
    };

  } catch (error) {
    return {
      stats: {},
      recentRegistrations: [],
      pendingPaymentQueue: [],
      error: error.message,
    };
  }
}