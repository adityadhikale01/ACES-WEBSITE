import MembershipApplication from './membershipModel.js';
import { AppError } from '../../utils/AppError.js';

export const submitApplication = async (req, res, next) => {
  const data = req.validatedBody || req.body;

  const existing = await MembershipApplication.findOne({
    email: data.email.toLowerCase(),
    status: 'PENDING',
  });

  if (existing) {
    return next(
      new AppError('You already have a pending membership application under review.', 409)
    );
  }

  const application = await MembershipApplication.create({
    ...data,
    email: data.email.toLowerCase(),
  });

  res.status(201).json({
    success: true,
    message: 'Membership application submitted successfully!',
    application,
  });
};

export const getAllApplications = async (req, res) => {
  const { status = 'PENDING' } = req.query;
  const filter = {};
  if (status && status !== 'ALL') {
    filter.status = status;
  }

  const applications = await MembershipApplication.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: applications.length,
    applications,
  });
};

export const reviewApplication = async (req, res, next) => {
  const { id } = req.params;
  const { status, reviewerNotes } = req.validatedBody || req.body;

  const application = await MembershipApplication.findById(id);
  if (!application) {
    return next(new AppError('Application not found', 404));
  }

  application.status = status;
  application.reviewerNotes = reviewerNotes || '';
  application.reviewedBy = req.userId;
  application.reviewedAt = new Date();
  await application.save();

  res.status(200).json({
    success: true,
    message: `Application marked as ${status}`,
    application,
  });
};
