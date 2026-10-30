import { api } from '../services/api.js';

export async function registerAction({ request }) {
  const formData = await request.formData();
  const name = formData.get('name') || formData.get('fullName');
  const email = formData.get('email');
  const password = formData.get('password');
  const department = formData.get('department') || 'Computer Engineering';
  const academicYear = formData.get('academicYear') || '';
  const prn = formData.get('prn') || '';
  const phone = formData.get('phone') || '';

  if (!name || !email || !password) {
    return { error: 'Full name, email, and password are required.' };
  }

  try {
    const res = await api.auth.register({
      name,
      fullName: name,
      email,
      password,
      department,
      academicYear,
      prn,
      phone,
    });
    return {
      success: true,
      user: res.user,
      token: res.token,
    };
  } catch (err) {
    return { error: err.message || 'Registration failed.' };
  }
}
