/**
 * Healthcare Professional (Doctor) Controller
 * Implements Doctor Module:
 * 1. Schedule Management (Availability and working hours)
 * 2. Consultation Provision (Conduct consultation, provide diagnosis, advice, and prescriptions)
 * 3. Patient Record Access (Retrieve patient longitudinal health records and past notes)
 * 4. Consultation Management (Review upcoming and completed sessions)
 */
import { db } from '../db/database.js';

/**
 * 1. Schedule Management: Get current doctor's schedule
 */
export function getDoctorSchedule(req, res) {
  try {
    const doctorId = req.user.id;
    const schedules = db.prepare(`
      SELECT id, dayOfWeek, startTime, endTime, slotDurationMinutes, isActive
      FROM schedules
      WHERE doctorId = ?
      ORDER BY 
        CASE dayOfWeek
          WHEN 'Monday' THEN 1
          WHEN 'Tuesday' THEN 2
          WHEN 'Wednesday' THEN 3
          WHEN 'Thursday' THEN 4
          WHEN 'Friday' THEN 5
          WHEN 'Saturday' THEN 6
          WHEN 'Sunday' THEN 7
        END
    `).all(doctorId);

    return res.json({
      success: true,
      schedules,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor schedule.',
      error: error.message,
    });
  }
}

/**
 * 1. Schedule Management: Update availability & working hours
 */
export function updateDoctorSchedule(req, res) {
  try {
    const doctorId = req.user.id;
    const { schedules } = req.body; // Array of { dayOfWeek, startTime, endTime, slotDurationMinutes, isActive }

    if (!Array.isArray(schedules)) {
      return res.status(400).json({
        success: false,
        message: 'Schedules payload must be an array of schedule items.',
      });
    }

    const deleteOld = db.prepare('DELETE FROM schedules WHERE doctorId = ?');
    const insertNew = db.prepare(`
      INSERT INTO schedules (id, doctorId, dayOfWeek, startTime, endTime, slotDurationMinutes, isActive)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const updateTx = db.transaction((items) => {
      deleteOld.run(doctorId);
      items.forEach((item, index) => {
        insertNew.run(
          `sch-${doctorId}-${index}-${Date.now().toString(36)}`,
          doctorId,
          item.dayOfWeek,
          item.startTime || '09:00',
          item.endTime || '17:00',
          item.slotDurationMinutes || 30,
          item.isActive !== undefined ? (item.isActive ? 1 : 0) : 1
        );
      });
    });

    updateTx(schedules);

    return res.json({
      success: true,
      message: 'Confirmation: Working hours and availability schedule updated successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update schedule.',
      error: error.message,
    });
  }
}

/**
 * Consultation Management: List appointments assigned to this doctor
 */
export function getDoctorAppointments(req, res) {
  try {
    const doctorId = req.user.id;
    const { status } = req.query;

    let query = `
      SELECT 
        a.id,
        a.patientId,
        p.name as patientName,
        p.email as patientEmail,
        p.phone as patientPhone,
        p.avatarUrl as patientAvatar,
        a.appointmentDate,
        a.timeSlot,
        a.reason,
        a.status,
        a.createdAt,
        c.id as consultationId,
        c.diagnosis,
        c.medicalAdvice,
        c.prescriptionJson,
        c.followUpDate,
        c.completedAt
      FROM appointments a
      JOIN users p ON a.patientId = p.id
      LEFT JOIN consultations c ON a.id = c.appointmentId
      WHERE a.doctorId = ?
    `;
    const params = [doctorId];

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    query += ' ORDER BY a.appointmentDate DESC, a.timeSlot DESC';
    const appointments = db.prepare(query).all(...params);

    // Parse prescriptions JSON if exists
    const formatted = appointments.map((apt) => ({
      ...apt,
      prescriptions: apt.prescriptionJson ? JSON.parse(apt.prescriptionJson) : [],
    }));

    return res.json({
      success: true,
      consultations: formatted,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve doctor consultations.',
      error: error.message,
    });
  }
}

/**
 * 2. Consultation Provision: Submit diagnosis, medical advice, and prescriptions
 */
export function provideConsultation(req, res) {
  try {
    const doctorId = req.user.id;
    const { appointmentId, diagnosis, medicalAdvice, prescriptions = [], followUpDate } = req.body;

    if (!appointmentId || !diagnosis || !medicalAdvice) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID, diagnosis, and medical advice are required.',
      });
    }

    // Verify appointment belongs to this doctor
    const appointment = db.prepare('SELECT id, patientId, status FROM appointments WHERE id = ? AND doctorId = ?').get(appointmentId, doctorId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found or not assigned to you.',
      });
    }

    const prescriptionJson = JSON.stringify(prescriptions);
    const consultationId = `con-${Date.now().toString(36)}`;

    const consultationTx = db.transaction(() => {
      // Upsert consultation record
      db.prepare(`
        INSERT INTO consultations (id, appointmentId, doctorId, patientId, diagnosis, medicalAdvice, prescriptionJson, followUpDate, completedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(appointmentId) DO UPDATE SET
          diagnosis = excluded.diagnosis,
          medicalAdvice = excluded.medicalAdvice,
          prescriptionJson = excluded.prescriptionJson,
          followUpDate = excluded.followUpDate,
          completedAt = CURRENT_TIMESTAMP
      `).run(consultationId, appointmentId, doctorId, appointment.patientId, diagnosis, medicalAdvice, prescriptionJson, followUpDate || null);

      // Update appointment status to COMPLETED
      db.prepare("UPDATE appointments SET status = 'COMPLETED' WHERE id = ?").run(appointmentId);
    });

    consultationTx();

    return res.status(201).json({
      success: true,
      message: 'Confirmation: Medical consultation recorded and advice submitted successfully.',
      consultationId,
    });
  } catch (error) {
    console.error('Consultation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record consultation.',
      error: error.message,
    });
  }
}

/**
 * 3. Patient Record Access: Retrieve patient medical history by Patient ID
 */
export function getPatientHistory(req, res) {
  try {
    const { patientId } = req.params;

    const patient = db.prepare('SELECT id, name, email, phone, avatarUrl, createdAt FROM users WHERE id = ? AND role = "PATIENT"').get(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient record not found.',
      });
    }

    // Health records (EHR)
    let healthRecord = db.prepare(`
      SELECT bloodGroup, allergies, chronicConditions, currentMedications, emergencyContactName, emergencyContactPhone, updatedAt
      FROM health_records
      WHERE patientId = ?
    `).get(patientId);

    if (!healthRecord) {
      healthRecord = {
        bloodGroup: 'Not Recorded',
        allergies: 'None reported',
        chronicConditions: 'None reported',
        currentMedications: 'None',
        emergencyContactName: 'None',
        emergencyContactPhone: 'None',
      };
    }

    // Past consultations
    const pastConsultations = db.prepare(`
      SELECT 
        c.id as consultationId,
        c.appointmentId,
        d.name as doctorName,
        d.specialty as doctorSpecialty,
        a.appointmentDate,
        a.reason,
        c.diagnosis,
        c.medicalAdvice,
        c.prescriptionJson,
        c.followUpDate,
        c.completedAt
      FROM consultations c
      JOIN appointments a ON c.appointmentId = a.id
      JOIN users d ON c.doctorId = d.id
      WHERE c.patientId = ?
      ORDER BY c.completedAt DESC
    `).all(patientId);

    const formattedHistory = pastConsultations.map((c) => ({
      ...c,
      prescriptions: c.prescriptionJson ? JSON.parse(c.prescriptionJson) : [],
    }));

    return res.json({
      success: true,
      patient,
      healthRecord,
      pastConsultations: formattedHistory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to access patient records.',
      error: error.message,
    });
  }
}
