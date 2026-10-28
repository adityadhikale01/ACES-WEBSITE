import jwt from 'jsonwebtoken';
import User from '../features/auth/userModel.js';
import { AppError } from '../utils/AppError.js';

export const authMiddleware = async (req, res, next) => {
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(new AppError('Authentication required. Please login.', 401));
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET || 'aces_super_secret_access_jwt_key_2026_kbtcoe'
    );

    const user = await User.findById(decoded.id || decoded.userId).select('-passwordHash');
    if (!user || !user.isActive) {
      return next(new AppError('User session expired or user deactivated.', 401));
    }

    req.user = user;
    req.userId = user._id.toString();
    req.userRole = user.role;
    next();
  } catch (err) {
    return next(new AppError('Invalid or expired authentication token.', 401));
  }
};

export const optionalAuth = async (req, res, next) => {
  let token = null;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET || 'aces_super_secret_access_jwt_key_2026_kbtcoe'
    );
    const user = await User.findById(decoded.id || decoded.userId).select('-passwordHash');
    if (user && user.isActive) {
      req.user = user;
      req.userId = user._id.toString();
      req.userRole = user.role;
    }
  } catch {
    // Ignore invalid optional tokens
  }
  next();
};

export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Forbidden: You lack permissions for this resource', 403));
    }
    next();
  };
};

// Specialized RBAC guards
export const requireSuperAdmin = [authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN')];
export const requireEventAdmin = [authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN', 'PRESIDENT')];
export const requireTeamAdmin = [authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN', 'PRESIDENT')];
export const requireActivityAdmin = [authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN', 'FACULTY')];
export const requireMembershipAdmin = [authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN', 'PRESIDENT')];
export const requireContactAdmin = [authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN', 'PRESIDENT')];
export const requireAdmin = [authMiddleware, requireRoles('SUPER_ADMIN', 'ADMIN', 'FACULTY', 'PRESIDENT')];

export default authMiddleware;
