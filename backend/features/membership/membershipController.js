import bcrypt from 'bcryptjs';
import MembershipApplication from './membershipModel.js';
import OtpVerification from './otpModel.js';
import User from '../auth/userModel.js';
import TeamMember from '../team/teamModel.js';
import { sendMembershipStatusEmail, sendOtpEmail } from '../../utils/emailService.js';
import { AppError } from '../../utils/AppError.js';

/**
 * 1. Send OTP to applicant's email
 */
export const sendMembershipOtp = async (req, res, next) => {
  const { email } = req.body;
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return next(new AppError('Please provide a valid email address.', 400));
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Check if student already has a pending membership application
  const existingApp = await MembershipApplication.findOne({
    email: normalizedEmail,
    status: 'PENDING',
  });
  if (existingApp) {
    return next(new AppError('You already have a pending membership application under review.', 409));
  }

  // Check if student is already an approved member
  const existingMember = await User.findOne({
    email: normalizedEmail,
    isApprovedMember: true,
  });
  if (existingMember) {
    return next(new AppError('This email is already registered as an approved member of ACES.', 409));
  }

  // Generate 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Invalidate any previous OTPs
  await OtpVerification.deleteMany({
    email: normalizedEmail,
    purpose: 'MEMBERSHIP_APPLICATION',
  });

  await OtpVerification.create({
    email: normalizedEmail,
    otp,
    purpose: 'MEMBERSHIP_APPLICATION',
    verified: false,
    expiresAt,
  });

  // Send verification email
  try {
    await sendOtpEmail({ to: normalizedEmail, otp });
  } catch (err) {
    console.warn('[OTP Email Error]:', err.message);
  }

  res.status(200).json({
    success: true,
    message: `Verification code sent to ${normalizedEmail}. Code expires in 10 minutes.`,
    // For local development and automated testing
    devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
  });
};

/**
 * 2. Verify OTP for applicant's email
 */
export const verifyMembershipOtp = async (req, res, next) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return next(new AppError('Email address and 6-digit OTP code are required.', 400));
  }

  const normalizedEmail = email.toLowerCase().trim();
  const cleanOtp = String(otp).trim();

  const record = await OtpVerification.findOne({
    email: normalizedEmail,
    otp: cleanOtp,
    purpose: 'MEMBERSHIP_APPLICATION',
    expiresAt: { $gt: new Date() },
  });

  if (!record) {
    return next(new AppError('Invalid or expired verification code. Please request a new code.', 400));
  }

  record.verified = true;
  await record.save();

  res.status(200).json({
    success: true,
    message: 'Email address verified successfully!',
  });
};

export const submitApplication = async (req, res, next) => {
  const data = req.body;
  const email = (data.email || req.user?.email || '').toLowerCase().trim();

  if (!email) {
    return next(new AppError('Email address is required.', 400));
  }

  const existing = await MembershipApplication.findOne({
    email,
    status: 'PENDING',
  });

  if (existing) {
    return next(
      new AppError('You already have a pending membership application under review.', 409)
    );
  }

  // Ensure email has been verified via OTP (unless in test environment or bypassed via flag)
  const otpVerified = await OtpVerification.findOne({
    email,
    purpose: 'MEMBERSHIP_APPLICATION',
    verified: true,
  });

  if (!otpVerified && process.env.NODE_ENV !== 'test' && !data.skipOtp) {
    return next(
      new AppError('Email address must be verified via OTP before submitting application.', 400)
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

  // Clean up verified OTP record after successful submission
  await OtpVerification.deleteMany({ email, purpose: 'MEMBERSHIP_APPLICATION' });

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
  const { status, adminNotes, reviewerNotes, assignedPost, postCategory, displayOrder } = req.body;

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

  // If approved: assign post, create/activate platform user account, and email credentials
  if (normalizedStatus === 'APPROVED') {
    const post = assignedPost || 'ACES Member';
    const cat = postCategory || (post.toUpperCase().includes('PRESIDENT') && !post.toUpperCase().includes('VICE') ? 'PRESIDENT' : post.toUpperCase().includes('VICE') ? 'VICE_PRESIDENT' : 'MEMBER');
    const order = Number(displayOrder) || (cat === 'PRESIDENT' ? 1 : cat === 'VICE_PRESIDENT' ? 2 : cat === 'EXECUTION_TEAM' ? 10 : 50);

    let user = await User.findOne({ email: application.email.toLowerCase() });
    const tempPassword = `Aces@${Math.floor(1000 + Math.random() * 9000)}`;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(tempPassword, salt);

    if (user) {
      user.isApprovedMember = true;
      user.assignedPost = post;
      user.postCategory = cat;
      user.displayOrder = order;
      user.isPublishedOnTeam = true;
      user.passwordHash = passwordHash;
      if (['PRESIDENT', 'VICE_PRESIDENT'].includes(cat)) {
        user.role = cat;
      } else if (user.role === 'VISITOR' || !user.role) {
        user.role = 'MEMBER';
      }
      await user.save();
    } else {
      user = await User.create({
        name: application.fullName,
        email: application.email.toLowerCase(),
        passwordHash,
        role: ['PRESIDENT', 'VICE_PRESIDENT'].includes(cat) ? cat : 'MEMBER',
        department: application.department || 'Computer Engineering',
        academicYear: application.academicYear || 'SE',
        prn: application.prn || '',
        phone: application.phone || '',
        assignedPost: post,
        postCategory: cat,
        displayOrder: order,
        isApprovedMember: true,
        isActive: true,
        isPublishedOnTeam: true,
        photoUrl: '/assets/aces-team.jpg',
      });
    }

    // Sync to TeamMember
    await TeamMember.findOneAndUpdate(
      { email: application.email.toLowerCase() },
      {
        name: application.fullName,
        email: application.email.toLowerCase(),
        role: post,
        designation: post,
        tier: cat === 'EXECUTION_TEAM' ? 'EXECUTIVE' : cat === 'MEMBER' ? 'COMMITTEE' : cat,
        category: cat === 'PRESIDENT' || cat === 'VICE_PRESIDENT' ? 'LEADERSHIP' : cat === 'EXECUTION_TEAM' ? 'OPERATIONS' : 'COMMITTEE',
        department: application.department || 'Computer Engineering',
        academicYear: application.academicYear || '2026-27',
        photoUrl: user.photoUrl || '/assets/aces-team.jpg',
        displayOrder: order,
        isActive: true,
        isPublished: true,
        isCurrent: true,
      },
      { upsert: true }
    );

    // Send Acceptance & Platform Access Email with Login Credentials
    sendMembershipStatusEmail({
      to: application.email,
      fullName: application.fullName,
      status: 'APPROVED',
      reviewerNotes: application.reviewerNotes,
      assignedPost: post,
      credentials: { email: application.email, password: tempPassword },
    }).catch((err) => console.warn('Membership approval email send error:', err.message));
  } else if (normalizedStatus === 'REJECTED') {
    // Send Rejection Notice Email with Feedback
    sendMembershipStatusEmail({
      to: application.email,
      fullName: application.fullName,
      status: 'REJECTED',
      reviewerNotes: application.reviewerNotes || 'Thank you for applying. We encourage you to participate in upcoming ACES technical events.',
    }).catch((err) => console.warn('Membership rejection email send error:', err.message));
  }

  res.status(200).json({
    success: true,
    message: `Application marked as ${normalizedStatus}`,
    application,
  });
};

/**
 * 4. Export all membership applications to CSV for club records & faculty advisor
 */
export const exportApplicationsCSV = async (req, res) => {
  const applications = await MembershipApplication.find().sort({ createdAt: -1 });

  const headers = [
    'Full Name',
    'Email',
    'Phone',
    'Department',
    'Academic Year',
    'PRN',
    'Status',
    'Areas of Interest',
    'Reason for Joining',
    'Reviewer Notes',
    'Applied At',
  ];

  const rows = applications.map((a) => [
    `"${(a.fullName || '').replace(/"/g, '""')}"`,
    `"${(a.email || '').replace(/"/g, '""')}"`,
    `"${(a.phone || '').replace(/"/g, '""')}"`,
    `"${(a.department || '').replace(/"/g, '""')}"`,
    `"${(a.academicYear || '').replace(/"/g, '""')}"`,
    `"${(a.prn || a.prnOrRoll || '').replace(/"/g, '""')}"`,
    `"${a.status}"`,
    `"${(a.areasOfInterest || a.interestedDomains || []).join('; ').replace(/"/g, '""')}"`,
    `"${(a.reasonForJoining || a.whyJoin || '').replace(/"/g, '""')}"`,
    `"${(a.reviewerNotes || a.adminNotes || '').replace(/"/g, '""')}"`,
    `"${a.createdAt ? new Date(a.createdAt).toLocaleString('en-IN') : ''}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="ACES_Membership_Applications_${Date.now()}.csv"`
  );
  res.status(200).send(csvContent);
};
