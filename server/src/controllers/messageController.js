/**
 * Communication Tools / Message Controller
 * Facilitates bidirectional messaging between patients and healthcare professionals
 * within the context of consultation sessions.
 */
import { db } from '../db/database.js';

/**
 * Send a message within a consultation appointment
 */
export function sendMessage(req, res) {
  try {
    const senderId = req.user.id;
    const { appointmentId, content, receiverId } = req.body;

    if (!appointmentId || !content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID and message content are required.',
      });
    }

    // Verify appointment exists
    const appointment = db.prepare('SELECT patientId, doctorId FROM appointments WHERE id = ?').get(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    // Ensure sender is part of this appointment
    if (senderId !== appointment.patientId && senderId !== appointment.doctorId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to send messages for this consultation.',
      });
    }

    // Determine receiver
    const actualReceiverId = receiverId || (senderId === appointment.patientId ? appointment.doctorId : appointment.patientId);

    const messageId = `msg-${Date.now().toString(36)}`;

    db.prepare(`
      INSERT INTO messages (id, appointmentId, senderId, receiverId, content, sentAt)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(messageId, appointmentId, senderId, actualReceiverId, content.trim());

    const created = db.prepare(`
      SELECT m.id, m.appointmentId, m.senderId, u.name as senderName, m.receiverId, m.content, m.sentAt
      FROM messages m
      JOIN users u ON m.senderId = u.id
      WHERE m.id = ?
    `).get(messageId);

    return res.status(201).json({
      success: true,
      message: 'Confirmation: Message sent successfully.',
      data: created,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to send message.',
      error: error.message,
    });
  }
}

/**
 * Retrieve message log for an appointment
 */
export function getAppointmentMessages(req, res) {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;

    const appointment = db.prepare('SELECT patientId, doctorId FROM appointments WHERE id = ?').get(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    // Admin or participants can view
    if (req.user.role !== 'ADMIN' && userId !== appointment.patientId && userId !== appointment.doctorId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view these messages.',
      });
    }

    const messages = db.prepare(`
      SELECT 
        m.id,
        m.appointmentId,
        m.senderId,
        u.name as senderName,
        u.role as senderRole,
        u.avatarUrl as senderAvatar,
        m.receiverId,
        m.content,
        m.sentAt
      FROM messages m
      JOIN users u ON m.senderId = u.id
      WHERE m.appointmentId = ?
      ORDER BY m.sentAt ASC
    `).all(appointmentId);

    return res.json({
      success: true,
      messages,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch messages.',
      error: error.message,
    });
  }
}
