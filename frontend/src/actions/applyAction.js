import { api } from '../services/api.js';

export async function applyAction({ request }) {
  const formData = await request.formData();
  const fullName = formData.get('fullName');
  const email = formData.get('email');
  const phone = formData.get('phone');
  const academicYear = formData.get('academicYear');
  const division = formData.get('division') || '';
  const prn = formData.get('prn') || '';
  const whyJoin = formData.get('whyJoin');
  const technicalSkills = formData.get('technicalSkills') || '';
  const pastExperience = formData.get('pastExperience') || '';

  if (!fullName || !email || !phone || !academicYear || !whyJoin) {
    return { error: 'Please fill in all required fields.' };
  }

  try {
    const res = await api.membership.apply({
      fullName,
      email,
      phone,
      department: 'Computer Engineering',
      academicYear,
      division,
      prn,
      whyJoin,
      technicalSkills,
      pastExperience,
    });
    return { success: true, message: res.message || 'Application submitted successfully!' };
  } catch (err) {
    return { error: err.message || 'Failed to submit application.' };
  }
}
