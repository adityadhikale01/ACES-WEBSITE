import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User.js';
import { signToken, AuthRequest } from '../middleware/auth.js';

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  department: z.string().default('Computer Engineering'),
  academicYear: z.enum(['FE', 'SE', 'TE', 'BE', 'ALUMNI', 'FACULTY', 'OTHER']).default('SE'),
});

export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password, phone, department, academicYear } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      passwordHash,
      phone,
      department,
      academicYear,
      role: 'MEMBER', // Public signup defaults to MEMBER, never ADMIN
      isApprovedMember: false,
    });

    const token = signToken(user);
    res.cookie('token', token, COOKIE_OPTIONS);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        department: user.department,
        academicYear: user.academicYear,
        phone: user.phone,
        isApprovedMember: user.isApprovedMember,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = signToken(user);
    res.cookie('token', token, COOKIE_OPTIONS);

    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        department: user.department,
        academicYear: user.academicYear,
        phone: user.phone,
        isApprovedMember: user.isApprovedMember,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Login failed' });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.clearCookie('token', COOKIE_OPTIONS);
  res.json({ success: true, message: 'Logged out successfully.' });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  res.json({
    success: true,
    user: {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role,
      department: req.user.department,
      academicYear: req.user.academicYear,
      phone: req.user.phone,
      isApprovedMember: req.user.isApprovedMember,
    },
  });
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated' });
    return;
  }

  const { fullName, phone, department, academicYear } = req.body;

  try {
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(fullName && { fullName }),
        ...(phone !== undefined && { phone }),
        ...(department && { department }),
        ...(academicYear && { academicYear }),
      },
      { new: true }
    ).select('-passwordHash');

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updated,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
