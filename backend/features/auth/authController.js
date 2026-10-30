import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './userModel.js';
import TeamMember from '../team/teamModel.js';
import { saveUploadedFile } from '../../utils/fileStorage.js';
import { AppError } from '../../utils/AppError.js';

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.ACCESS_TOKEN_SECRET || 'aces_super_secret_access_jwt_key_2026_kbtcoe',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const register = async (req, res, next) => {
  const body = req.validatedBody || req.body;
  const name = body.name || body.fullName;
  const { email, password, department, academicYear, prn, phone } = body;

  if (!name) {
    return next(new AppError('Full name is required', 400));
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return next(new AppError('An account with this email already exists', 409));
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: 'MEMBER',
    department: department || 'Computer Engineering',
    academicYear,
    prn,
    phone,
    isActive: true,
  });

  const token = generateToken(newUser);

  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token,
    user: newUser.toSafeObject(),
  });
};

export const login = async (req, res, next) => {
  const { email, password } = req.validatedBody || req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  if (!user.isActive) {
    return next(new AppError('This account has been deactivated. Please contact ACES admin.', 403));
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = generateToken(user);

  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    user: user.toSafeObject(),
  });
};

export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user.toSafeObject(),
  });
};

export const logout = async (req, res) => {
  res.clearCookie('accessToken');
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

export const refresh = async (req, res, next) => {
  const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
  if (!token) {
    return next(new AppError('No refresh session', 401));
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET || 'aces_super_secret_access_jwt_key_2026_kbtcoe'
    );
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return next(new AppError('Session invalid', 401));
    }
    const newToken = generateToken(user);
    res.status(200).json({
      success: true,
      token: newToken,
      user: user.toSafeObject(),
    });
  } catch {
    return next(new AppError('Invalid token', 401));
  }
};

export const updateProfile = async (req, res, next) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const {
    name,
    fullName,
    phone,
    department,
    academicYear,
    bio,
    linkedinUrl,
    githubUrl,
    photoUrl,
    currentPassword,
    newPassword,
  } = req.body;

  if (name || fullName) user.name = fullName || name;
  if (phone !== undefined) user.phone = phone;
  if (department) user.department = department;
  if (academicYear) user.academicYear = academicYear;
  if (bio !== undefined) user.bio = bio;
  if (linkedinUrl !== undefined) user.linkedinUrl = linkedinUrl;
  if (githubUrl !== undefined) user.githubUrl = githubUrl;
  if (photoUrl) user.photoUrl = photoUrl;

  // Optional password change
  if (newPassword) {
    if (!currentPassword) {
      return next(new AppError('Current password is required to set a new password', 400));
    }
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return next(new AppError('Current password does not match', 400));
    }
    if (newPassword.length < 6) {
      return next(new AppError('New password must be at least 6 characters', 400));
    }
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
  }

  await user.save();

  // Keep TeamMember synced if user is also listed in team
  try {
    await TeamMember.updateMany(
      { $or: [{ email: user.email }, { name: user.name }] },
      {
        name: user.name,
        photoUrl: user.photoUrl,
        bio: user.bio,
        linkedinUrl: user.linkedinUrl,
        githubUrl: user.githubUrl,
        department: user.department,
        academicYear: user.academicYear,
      }
    );
  } catch (err) {
    // non-fatal
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully!',
    user: user.toSafeObject(),
  });
};

export const uploadProfilePhoto = async (req, res, next) => {
  const file = req.file || (req.files && req.files[0]);
  if (!file) {
    return next(new AppError('Please select an image file to upload', 400));
  }

  const user = await User.findById(req.userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  try {
    const customFilename = `member_${user._id}_${Date.now()}`;
    const photoUrl = await saveUploadedFile(file, 'members', customFilename);

    user.photoUrl = photoUrl;
    await user.save();

    // Sync to TeamMember
    await TeamMember.updateMany(
      { $or: [{ email: user.email }, { name: user.name }] },
      { photoUrl }
    );

    res.status(200).json({
      success: true,
      message: 'Profile photo updated successfully!',
      photoUrl,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return next(new AppError('Both current password and new password are required', 400));
  }
  if (newPassword.length < 6) {
    return next(new AppError('New password must be at least 6 characters long', 400));
  }

  const user = await User.findById(req.userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return next(new AppError('Current password is incorrect', 400));
  }

  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
};
