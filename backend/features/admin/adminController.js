import User from '../auth/userModel.js';
import Event from '../events/eventModel.js';
import Registration from '../registrations/registrationModel.js';
import PaymentProof from '../payments/paymentModel.js';
import MembershipApplication from '../membership/membershipModel.js';
import ContactMessage from '../contact/contactModel.js';
import { Album } from '../gallery/galleryModel.js';
import { AppError } from '../../utils/AppError.js';

export const getSystemStats = async (req, res) => {
  const now = new Date();

  const [
    totalUsers,
    totalApprovedMembers,
    pendingApplications,
    totalEvents,
    activeEvents,
    upcomingEvents,
    totalRegistrations,
    pendingPayments,
    confirmedPayments,
    totalAlbums,
    unreadMessages,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isApprovedMember: true }),
    MembershipApplication.countDocuments({ status: 'PENDING' }),
    Event.countDocuments(),
    Event.countDocuments({ status: 'PUBLISHED' }),
    Event.countDocuments({ status: 'PUBLISHED', startDate: { $gte: now } }),
    Registration.countDocuments({ status: { $in: ['REGISTERED', 'ATTENDED'] } }),
    PaymentProof.countDocuments({ verificationStatus: { $in: ['PENDING', 'PROOF_SUBMITTED', 'UNDER_REVIEW'] } }),
    PaymentProof.countDocuments({ verificationStatus: { $in: ['VERIFIED', 'APPROVED'] } }),
    Album.countDocuments(),
    ContactMessage.countDocuments({ isRead: false }),
  ]);

  const [recentRegistrations, recentApplications, recentPayments] = await Promise.all([
    Registration.find()
      .populate('eventId', 'title')
      .sort({ createdAt: -1 })
      .limit(5),
    MembershipApplication.find().sort({ createdAt: -1 }).limit(5),
    PaymentProof.find()
      .populate('eventId', 'title')
      .populate('userId', 'fullName name')
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalApprovedMembers,
      pendingApplications,
      totalEvents,
      activeEvents,
      upcomingEvents,
      totalRegistrations,
      pendingPayments,
      confirmedPayments,
      totalAlbums,
      unreadMessages,
    },
    recentActivity: {
      registrations: recentRegistrations,
      applications: recentApplications,
      payments: recentPayments,
    },
    recentRegistrations,
    pendingPaymentQueue: recentPayments,
  });
};

export const getAllUsers = async (req, res) => {
  const { role, search } = req.query;
  const filter = {};

  if (role && role !== 'ALL') {
    filter.role = role;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const users = await User.find(filter).select('-passwordHash').sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    count: users.length,
    users,
  });
};

export const updateUserRole = async (req, res, next) => {
  const { id } = req.params;
  const { role, isApprovedMember } = req.body;

  const update = {};
  if (role) {
    const validRoles = ['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'PRESIDENT', 'MEMBER', 'VISITOR'];
    if (!validRoles.includes(role)) {
      return next(new AppError(`Invalid role. Valid roles: ${validRoles.join(', ')}`, 400));
    }
    update.role = role;
  }
  if (isApprovedMember !== undefined) {
    update.isApprovedMember = Boolean(isApprovedMember);
  }

  const user = await User.findByIdAndUpdate(id, update, { new: true }).select('-passwordHash');
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    user,
  });
};

export const deleteUser = async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
};
