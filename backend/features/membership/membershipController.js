import MembershipApplication from './membershipModel.js';
import User from '../auth/userModel.js';
import { AppError } from '../../utils/AppError.js';

export const submitApplication = async (req, res, next) => {
  const data = req.body;
  const email = (data.email || req.user?.email || '').toLowerCase();

  const existing = await MembershipApplication.findOne({
    email,
    status: 'PENDING',
  });

  if (existing) {
    return next(
      new AppError('You already have a pending membership application under review.', 409)
    );
  }

  const application = await MembershipApplication.create({
    fullName: data.fullName || req.user?.fullName || req.user?.name,
    email,
    phone: data.phone || req.user?.phone || '',
    department: data.department || 'Computer Engineering',
    academicYear: data.academicYear || 'SE',
    prn: data.prn || data.prnOrRoll || '',
    prnOrRoll: data.prnOrRoll || data.prn || '',
    areasOfInterest: data.areasOfInterest || data.interestedDomains || [],
    interestedDomains: data.interestedDomains || data.areasOfInterest || [],
    reasonForJoining: data.reasonForJoining || data.whyJoin || '',
    whyJoin: data.whyJoin || data.reasonForJoining || '',
    technicalSkills: data.technicalSkills || '',
    pastExperience: data.pastExperience || '',
    status: 'PENDING',
  });

  res.status(201).json({
    success: true,
    message: 'Membership application submitted successfully!',
    application,
  });
};

export const getMyApplication = async (req, res) => {
  const application = await MembershipApplication.findOne({
    email: req.user.email.toLowerCase(),
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    application,
  });
};

export const getAllApplications = async (req, res) => {
  const { status, search } = req.query;
  const filter = {};
  if (status && status !== 'ALL') {
    filter.status = status === 'APPROVED' ? { $in: ['APPROVED', 'ACCEPTED'] } : status;
  }

  let applications = await MembershipApplication.find(filter).sort({ createdAt: -1 });

  if (search) {
    const s = search.toLowerCase();
    applications = applications.filter(
      (a) =>
        a.fullName?.toLowerCase().includes(s) ||
        a.email?.toLowerCase().includes(s) ||
        a.prn?.toLowerCase().includes(s)
    );
  }

  res.status(200).json({
    success: true,
    count: applications.length,
    applications,
  });
};

export const reviewApplication = async (req, res, next) => {
  const { id } = req.params;
  const { status, adminNotes, reviewerNotes } = req.body;

  const application = await MembershipApplication.findById(id);
  if (!application) {
    return next(new AppError('Application not found', 404));
  }

  const normalizedStatus = status === 'ACCEPTED' ? 'APPROVED' : status;

  application.status = normalizedStatus;
  application.adminNotes = adminNotes || reviewerNotes || '';
  application.reviewerNotes = reviewerNotes || adminNotes || '';
  application.reviewedBy = req.userId;
  application.reviewedAt = new Date();
  await application.save();

  // If approved, update user's isApprovedMember to true!
  if (normalizedStatus === 'APPROVED') {
    await User.findOneAndUpdate(
      { email: application.email.toLowerCase() },
      { isApprovedMember: true, role: 'MEMBER' }
    );
  }

  res.status(200).json({
    success: true,
    message: `Application marked as ${normalizedStatus}`,
    application,
  });
};
