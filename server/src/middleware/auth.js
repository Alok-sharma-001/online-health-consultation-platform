/**
 * Authentication and Role-Based Access Control (RBAC) Middleware
 * Verifies JWT tokens and enforces role restrictions on protected endpoints.
 */
import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { db } from '../db/database.js';

/**
 * Verify JWT token from Authorization header and attach user to request object
 */
export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token missing or invalid format.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    // Verify user exists and is active in database
    const user = db.prepare('SELECT id, name, email, role, specialty, phone, status, avatarUrl FROM users WHERE id = ?').get(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found or has been removed.',
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact an administrator.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token. Please log in again.',
      error: err.message,
    });
  }
}

/**
 * Middleware factory to enforce specific roles (e.g. ['ADMIN'], ['DOCTOR', 'ADMIN'])
 * @param  {...string} allowedRoles
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required prior to role verification.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`,
      });
    }

    next();
  };
}
