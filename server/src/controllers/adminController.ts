import { Response } from 'express';
import { User } from '../models/User.js';
import { Event } from '../models/Event.js';
import { EventRegistration } from '../models/EventRegistration.js';
import { MembershipApplication } from '../models/MembershipApplication.js';
import { ContactMessage } from '../models/ContactMessage.js';
import { AuthRequest } from '../middleware/auth.js';

export const getAdminStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      totalApprovedMembers,
      pendingApplications,
      totalEvents,
      activeEvents,
      totalRegistrations,
      unreadMessages,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isApprovedMember: true }),
      MembershipApplication.countDocuments({ status: 'PENDING' }),
      Event.countDocuments(),
      Event.countDocuments({ status: 'PUBLISHED' }),
      EventRegistration.countDocuments({ status: { $in: ['REGISTERED', 'ATTENDED'] } }),
      ContactMessage.countDocuments({ isRead: false }),
    ]);

    // Recent activity stream
    const recentRegistrations = await EventRegistration.find()
      .populate('eventId', 'title')
      .sort({ registrationDate: -1 })
      .limit(5);

    const recentApplications = await MembershipApplication.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalApprovedMembers,
        pendingApplications,
        totalEvents,
        activeEvents,
        totalRegistrations,
        unreadMessages,
      },
      recentActivity: {
        registrations: recentRegistrations,
        applications: recentApplications,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, search } = req.query;
    const filter: any = {};

    if (role && role !== 'ALL') {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { fullName: { $regex: search as string, $options: 'i' } },
        { email: { $regex: search as string, $options: 'i' } },
      ];
    }

    const users = await User.find(filter).select('-passwordHash').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role, isApprovedMember } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      {
        ...(role && { role }),
        ...(isApprovedMember !== undefined && { isApprovedMember }),
      },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({ success: true, message: 'User updated successfully', user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
