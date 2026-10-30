import bcrypt from 'bcryptjs';
import MembershipApplication from './membershipModel.js';
import User from '../auth/userModel.js';
import TeamMember from '../team/teamModel.js';
import { sendMembershipStatusEmail } from '../../utils/emailService.js';
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
    let tempPassword = null;

    if (user) {
      user.isApprovedMember = true;
      user.assignedPost = post;
      user.postCategory = cat;
      user.displayOrder = order;
      user.isPublishedOnTeam = true;
      if (['PRESIDENT', 'VICE_PRESIDENT'].includes(cat)) {
        user.role = cat;
      } else if (user.role === 'VISITOR') {
        user.role = 'MEMBER';
      }
      await user.save();
    } else {
      tempPassword = `Aces@${Math.floor(1000 + Math.random() * 9000)}`;
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(tempPassword, salt);

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

    // Send Acceptance & Platform Access Email
    sendMembershipStatusEmail({
      to: application.email,
      fullName: application.fullName,
      status: 'APPROVED',
      reviewerNotes: application.reviewerNotes,
      assignedPost: post,
      credentials: tempPassword ? { email: application.email, password: tempPassword } : null,
    }).catch((err) => console.warn('Membership approval email send error:', err.message));
  } else if (normalizedStatus === 'REJECTED') {
    // Send Rejection Notice Email
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
