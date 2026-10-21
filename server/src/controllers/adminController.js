/**
 * Administrator Controller
 * Implements Admin Module:
 * 1. User Management (CRUD users, role assignment, status toggling)
 * 2. Appointment Management (Master overview, status overrides, cancel/reschedule)
 * 3. System Settings (Global platform configuration persistence)
 * 4. System Analytics (Platform usage metrics, consultation trends, doctor specialties)
 */
import bcrypt from 'bcryptjs';
import { db } from '../db/database.js';

/**
 * 1. User Management: List all users with optional filtering
 */
export function getAllUsers(req, res) {
  try {
    const { role, search } = req.query;
    let query = 'SELECT id, name, email, role, specialty, phone, status, avatarUrl, createdAt FROM users WHERE 1=1';
    const params = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR specialty LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY createdAt DESC';
    const users = db.prepare(query).all(...params);

    return res.json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch users.',
      error: error.message,
    });
  }
}

/**
 * 1. User Management: Create user (Admin can create Doctor, Patient, or another Admin)
 */
export function createUser(req, res) {
  try {
    const { name, email, password, role, specialty, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required.',
      });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    const userId = `u-${role.toLowerCase()}-${Date.now().toString(36)}`;
    const passwordHash = bcrypt.hashSync(password, 10);

    db.prepare(`
      INSERT INTO users (id, name, email, passwordHash, role, specialty, phone, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
    `).run(userId, name.trim(), email.toLowerCase().trim(), passwordHash, role, specialty || null, phone || null);

    // Initialize doctor schedule or patient health record if applicable
    if (role === 'DOCTOR') {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const insertSchedule = db.prepare(`
        INSERT INTO schedules (id, doctorId, dayOfWeek, startTime, endTime, slotDurationMinutes, isActive)
        VALUES (?, ?, ?, '09:00', '17:00', 30, 1)
      `);
      days.forEach((day, idx) => {
        insertSchedule.run(`sch-${userId}-${idx}`, userId, day);
      });
    } else if (role === 'PATIENT') {
      db.prepare(`
        INSERT INTO health_records (id, patientId, bloodGroup, allergies, chronicConditions, currentMedications, emergencyContactName, emergencyContactPhone)
        VALUES (?, ?, 'Not Specified', 'None reported', 'None reported', 'None', 'None', 'None')
      `).run(`hr-${userId}`, userId);
    }

    return res.status(201).json({
      success: true,
      message: `Confirmation: User '${name}' created successfully with role '${role}'.`,
      userId,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create user.',
      error: error.message,
    });
  }
}

/**
 * 1. User Management: Update user details or role
 */
export function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, role, specialty, phone, status, password } = req.body;

    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (password && password.trim().length > 0) {
      const passwordHash = bcrypt.hashSync(password, 10);
      db.prepare(`
        UPDATE users
        SET name = COALESCE(?, name),
            email = COALESCE(?, email),
            role = COALESCE(?, role),
            specialty = COALESCE(?, specialty),
            phone = COALESCE(?, phone),
            status = COALESCE(?, status),
            passwordHash = ?
        WHERE id = ?
      `).run(name, email, role, specialty, phone, status, passwordHash, id);
    } else {
      db.prepare(`
        UPDATE users
        SET name = COALESCE(?, name),
            email = COALESCE(?, email),
            role = COALESCE(?, role),
            specialty = COALESCE(?, specialty),
            phone = COALESCE(?, phone),
            status = COALESCE(?, status)
        WHERE id = ?
      `).run(name, email, role, specialty, phone, status, id);
    }

    return res.json({
      success: true,
      message: `Confirmation: User '${id}' updated successfully.`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update user.',
      error: error.message,
    });
  }
}

/**
 * 1. User Management: Delete user
 */
export function deleteUser(req, res) {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Administrators cannot delete their own active account.',
      });
    }

    const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.json({
      success: true,
      message: `Confirmation: User '${id}' removed from system successfully.`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete user.',
      error: error.message,
    });
  }
}

/**
 * 2. Appointment Management: Master view of all appointments across platform
 */
export function getAllAppointments(req, res) {
  try {
    const { status, doctorId, patientId, date } = req.query;
    let query = `
      SELECT 
        a.id,
        a.patientId,
        p.name AS patientName,
        p.email AS patientEmail,
        p.phone AS patientPhone,
        a.doctorId,
        d.name AS doctorName,
        d.specialty AS doctorSpecialty,
        a.appointmentDate,
        a.timeSlot,
        a.reason,
        a.status,
        a.createdAt,
        c.id AS consultationId,
        c.diagnosis,
        c.completedAt
      FROM appointments a
      JOIN users p ON a.patientId = p.id
      JOIN users d ON a.doctorId = d.id
      LEFT JOIN consultations c ON a.id = c.appointmentId
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }
    if (doctorId) {
      query += ' AND a.doctorId = ?';
      params.push(doctorId);
    }
    if (patientId) {
      query += ' AND a.patientId = ?';
      params.push(patientId);
    }
    if (date) {
      query += ' AND a.appointmentDate = ?';
      params.push(date);
    }

    query += ' ORDER BY a.appointmentDate DESC, a.timeSlot DESC';
    const appointments = db.prepare(query).all(...params);

    return res.json({
      success: true,
      appointments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve appointments.',
      error: error.message,
    });
  }
}

/**
 * 2. Appointment Management: Admin schedule or update appointment
 */
export function updateAppointmentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, appointmentDate, timeSlot } = req.body;

    const apt = db.prepare('SELECT id FROM appointments WHERE id = ?').get(id);
    if (!apt) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    db.prepare(`
      UPDATE appointments
      SET status = COALESCE(?, status),
          appointmentDate = COALESCE(?, appointmentDate),
          timeSlot = COALESCE(?, timeSlot)
      WHERE id = ?
    `).run(status, appointmentDate, timeSlot, id);

    return res.json({
      success: true,
      message: `Confirmation: Appointment '${id}' updated successfully.`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update appointment.',
      error: error.message,
    });
  }
}

/**
 * 3. System Settings: Get current settings
 */
export function getSystemSettings(req, res) {
  try {
    const settings = db.prepare('SELECT key, value, description FROM system_settings').all();
    const settingsMap = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return res.json({
      success: true,
      settings: settingsMap,
      raw: settings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch system settings.',
      error: error.message,
    });
  }
}

/**
 * 3. System Settings: Update configuration settings
 */
export function updateSystemSettings(req, res) {
  try {
    const settings = req.body; // Key-value object
    const updateStmt = db.prepare(`
      INSERT INTO system_settings (key, value, description, updatedAt)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updatedAt = CURRENT_TIMESTAMP
    `);

    const updateMany = db.transaction((entries) => {
      for (const [key, value] of Object.entries(entries)) {
        updateStmt.run(key, String(value), `System setting for ${key}`);
      }
    });

    updateMany(settings);

    return res.json({
      success: true,
      message: 'Confirmation: System settings updated successfully.',
      settings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update system settings.',
      error: error.message,
    });
  }
}

/**
 * 4. System Analytics Dashboard: Aggregate metrics and statistics
 */
export function getSystemAnalytics(req, res) {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const totalDoctors = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'DOCTOR'").get().count;
    const totalPatients = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'PATIENT'").get().count;

    const totalAppointments = db.prepare('SELECT COUNT(*) as count FROM appointments').get().count;
    const completedAppointments = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'COMPLETED'").get().count;
    const scheduledAppointments = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'SCHEDULED'").get().count;
    const cancelledAppointments = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'CANCELLED'").get().count;

    // Doctor distribution by specialty
    const specialtyDistribution = db.prepare(`
      SELECT specialty, COUNT(*) as count
      FROM users
      WHERE role = 'DOCTOR' AND specialty IS NOT NULL
      GROUP BY specialty
    `).all();

    // Consultations completed by doctor
    const doctorConsultationStats = db.prepare(`
      SELECT d.name as doctorName, d.specialty, COUNT(c.id) as completedCount
      FROM users d
      LEFT JOIN consultations c ON d.id = c.doctorId
      WHERE d.role = 'DOCTOR'
      GROUP BY d.id
    `).all();

    // Recent 5 appointments
    const recentAppointments = db.prepare(`
      SELECT a.id, p.name as patientName, d.name as doctorName, a.appointmentDate, a.timeSlot, a.status
      FROM appointments a
      JOIN users p ON a.patientId = p.id
      JOIN users d ON a.doctorId = d.id
      ORDER BY a.createdAt DESC
      LIMIT 5
    `).all();

    return res.json({
      success: true,
      analytics: {
        users: { total: totalUsers, doctors: totalDoctors, patients: totalPatients },
        appointments: {
          total: totalAppointments,
          completed: completedAppointments,
          scheduled: scheduledAppointments,
          cancelled: cancelledAppointments,
          completionRate: totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0,
        },
        specialtyDistribution,
        doctorConsultationStats,
        recentAppointments,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to generate analytics.',
      error: error.message,
    });
  }
}
