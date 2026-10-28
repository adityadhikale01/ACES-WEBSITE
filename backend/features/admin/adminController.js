import User from '../auth/userModel.js';
import Event from '../events/eventModel.js';
import Registration from '../registrations/registrationModel.js';
import PaymentProof from '../payments/paymentModel.js';
import MembershipApplication from '../membership/membershipModel.js';
import ContactMessage from '../contact/contactModel.js';
import { AppError } from '../../utils/AppError.js';

export const getSystemStats = async (req, res) => {
  const [
    totalEvents,
    upcomingEvents,
    totalRegistrations,
    pendingPayments,
    verifiedPayments,
    pendingApplications,
    unreadMessages,
    totalUsers,
  ] = await Promise.all([
    Event.countDocuments(),
    Event.countDocuments({ eventDate: { $gte: new Date() } }),
    Registration.countDocuments(),
    PaymentProof.countDocuments({ verificationStatus: 'PENDING' }),
    PaymentProof.countDocuments({ verificationStatus: 'VERIFIED' }),
    MembershipApplication.countDocuments({ status: 'PENDING' }),
    ContactMessage.countDocuments({ isRead: false }),
    User.countDocuments(),
  ]);

  const recentRegistrations = await Registration.find()
    .populate('eventId', 'title')
    .sort({ createdAt: -1 })
    .limit(5);

  const pendingPaymentQueue = await PaymentProof.find({ verificationStatus: 'PENDING' })
    .populate('userId', 'name email prn')
    .populate('eventId', 'title feeAmountInPaise')
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    stats: {
      totalEvents,
      upcomingEvents,
      totalRegistrations,
      pendingPayments,
      verifiedPayments,
      pendingApplications,
      unreadMessages,
      totalUsers,
    },
    recentRegistrations,
    pendingPaymentQueue,
  });
};

export const getAllUsers = async (req, res) => {
  const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    count: users.length,
    users,
  });
};

export const updateUserRole = async (req, res, next) => {
  const { id } = req.params;
  const { role } = req.body;

  const validRoles = ['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'PRESIDENT', 'MEMBER', 'VISITOR'];
  if (!validRoles.includes(role)) {
    return next(new AppError(`Invalid role. Valid roles: ${validRoles.join(', ')}`, 400));
  }

  const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-passwordHash');
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    message: `User role updated to ${role}`,
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
