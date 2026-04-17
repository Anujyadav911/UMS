import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { verifyAccessToken } from '../utils/jwt.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    return next(new Error('Not authorized to access this route'));
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      res.status(401);
      return next(new Error('User not found'));
    }

    if (user.status === 'inactive') {
      res.status(403);
      return next(new Error('Account is deactivated'));
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    return next(new Error('Not authorized to access this route'));
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error('Not authorized'));
    }
    
    if (!roles.includes(req.user.role)) {
      res.status(403);
      return next(new Error(`User role ${req.user.role} is not authorized to access this route`));
    }
    
    next();
  };
};
