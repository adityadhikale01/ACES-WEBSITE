import { api } from '../services/api.js';

export async function loginAction({ request }) {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || !password) {
    return { error: 'Please provide both email and password.' };
  }

  try {
    const res = await api.auth.login({ email, password });
    return {
      success: true,
      user: res.user,
      token: res.token,
    };
  } catch (err) {
    return { error: err.message || 'Login failed. Please verify credentials.' };
  }
}
