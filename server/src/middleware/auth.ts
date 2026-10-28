import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser, UserRole } from '../models/User.js';

export interface AuthRequest extends Request {
  user?: IUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'aces_kbtcoe_secure_jwt_secret_key_2026_innovation';

export const signToken = (user: IUser): string => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: UserRole };
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid session. User no longer exists.' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (user) {
        req.user = user;
      }
    }
  } catch {
    // Continue as guest
  }
  next();
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access forbidden. Required role: [${roles.join(', ')}]. Your current role is: ${req.user.role}.`,
      });
      return;
    }

    next();
  };
};

// Granular Role Guards for ACES Departmental Club
export const requireSuperAdmin = requireRole('SUPER_ADMIN', 'ADMIN');
export const requireEventAdmin = requireRole('SUPER_ADMIN', 'ADMIN', 'PRESIDENT');
export const requireTeamAdmin = requireRole('SUPER_ADMIN', 'ADMIN', 'PRESIDENT');
export const requireActivityAdmin = requireRole('SUPER_ADMIN', 'ADMIN', 'FACULTY');
export const requireMembershipAdmin = requireRole('SUPER_ADMIN', 'ADMIN', 'PRESIDENT');
export const requireContactAdmin = requireRole('SUPER_ADMIN', 'ADMIN', 'PRESIDENT');

// General admin guard (permits SUPER_ADMIN, ADMIN, FACULTY, PRESIDENT)
export const requireAdmin = requireRole('SUPER_ADMIN', 'ADMIN', 'FACULTY', 'PRESIDENT');
