/**
 * Authentication Controller
 * Handles user registration, credentials verification, profile retrieval, and updates.
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/database.js';
import { config } from '../config/config.js';

/**
 * Register a new Patient
 */
export function register(req, res) {
  try {
    const { name, email, password, phone, role = 'PATIENT', specialty } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.',
      });
    }

    // Check if email already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address is already registered.',
      });
    }

    const userId = `u-${role.toLowerCase()}-${Date.now().toString(36)}`;
    const passwordHash = bcrypt.hashSync(password, 10);
    const assignedRole = role === 'DOCTOR' || role === 'ADMIN' ? role : 'PATIENT';

    const insertUser = db.prepare(`
      INSERT INTO users (id, name, email, passwordHash, role, specialty, phone, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
    `);

    insertUser.run(
      userId,
      name.trim(),
      email.toLowerCase().trim(),
      passwordHash,
      assignedRole,
      specialty || null,
      phone || null
    );

    // If patient, initialize default health record
    if (assignedRole === 'PATIENT') {
      db.prepare(`
        INSERT INTO health_records (id, patientId, bloodGroup, allergies, chronicConditions, currentMedications, emergencyContactName, emergencyContactPhone)
        VALUES (?, ?, 'Not Specified', 'None reported', 'None reported', 'None', 'None', 'None')
      `).run(`hr-${Date.now().toString(36)}`, userId);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, email: email.toLowerCase().trim(), role: assignedRole },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        id: userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role: assignedRole,
        specialty: specialty || null,
        phone: phone || null,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete registration.',
      error: error.message,
    });
  }
}

/**
 * Login user with email & password
 */
export function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact an administrator.',
      });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        specialty: user.specialty,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login.',
      error: error.message,
    });
  }
}

/**
 * Retrieve active profile details
 */
export function getMe(req, res) {
  return res.json({
    success: true,
    user: req.user,
  });
}

/**
 * Update authenticated user profile
 */
export function updateProfile(req, res) {
  try {
    const { name, phone, avatarUrl, password } = req.body;
    const userId = req.user.id;

    if (password && password.trim().length > 0) {
      const passwordHash = bcrypt.hashSync(password, 10);
      db.prepare(`
        UPDATE users
        SET name = COALESCE(?, name),
            phone = COALESCE(?, phone),
            avatarUrl = COALESCE(?, avatarUrl),
            passwordHash = ?
        WHERE id = ?
      `).run(name, phone, avatarUrl, passwordHash, userId);
    } else {
      db.prepare(`
        UPDATE users
        SET name = COALESCE(?, name),
            phone = COALESCE(?, phone),
            avatarUrl = COALESCE(?, avatarUrl)
        WHERE id = ?
      `).run(name, phone, avatarUrl, userId);
    }

    const updatedUser = db.prepare('SELECT id, name, email, role, specialty, phone, avatarUrl FROM users WHERE id = ?').get(userId);

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile.',
      error: error.message,
    });
  }
}
