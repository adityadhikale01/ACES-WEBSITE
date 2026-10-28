import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './userModel.js';
import { AppError } from '../../utils/AppError.js';

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, role: user.role },
    process.env.ACCESS_TOKEN_SECRET || 'aces_super_secret_access_jwt_key_2026_kbtcoe',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const register = async (req, res, next) => {
  const { name, email, password, department, academicYear, prn, phone } = req.validatedBody || req.body;

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
