import { api } from '../services/api.js';

export async function contactAction({ request }) {
  const formData = await request.formData();
  const name = formData.get('name');
  const email = formData.get('email');
  const subject = formData.get('subject');
  const message = formData.get('message');

  if (!name || !email || !subject || !message) {
    return { error: 'All fields are required.' };
  }

  try {
    const res = await api.contact.submit({ name, email, subject, message });
    return { success: true, message: res.message || 'Message sent successfully!' };
  } catch (err) {
    return { error: err.message || 'Failed to submit message.' };
  }
}
