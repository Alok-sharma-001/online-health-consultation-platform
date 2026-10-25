/**
 * Patient Controller
 * Implements Patient Module:
 * 1. Consultation Booking (Doctor search, slot availability check, booking creation)
 * 2. Receive Medical Advice (View post-consultation diagnoses, prescriptions, and follow-ups)
 * 3. Health Record Management (CRUD on personal medical background and emergency contacts)
 * 4. Patient Dashboard & Appointments List
 */
import { db } from '../db/database.js';

/**
 * Get list of all active doctors for patient booking
 */
export function getDoctorsList(req, res) {
  try {
    const { specialty } = req.query;
    let query = `
      SELECT id, name, email, specialty, phone, avatarUrl
      FROM users
      WHERE role = 'DOCTOR' AND status = 'ACTIVE'
    `;
    const params = [];

    if (specialty) {
      query += ' AND specialty = ?';
      params.push(specialty);
    }

    query += ' ORDER BY name ASC';
    const doctors = db.prepare(query).all(...params);

    return res.json({
      success: true,
      doctors,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve doctors list.',
      error: error.message,
    });
  }
}

/**
 * 1. Consultation Booking: Get available time slots for a doctor on a specific date
 */
export function getAvailableSlots(req, res) {
  try {
    const { doctorId } = req.params;
    const { date } = req.query; // YYYY-MM-DD

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "date" (YYYY-MM-DD) is required.',
      });
    }

    // Determine day of the week
    const targetDate = new Date(`${date}T00:00:00Z`);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[targetDate.getUTCDay()];

    // Get doctor's working schedule for this day
    const schedule = db.prepare(`
      SELECT startTime, endTime, slotDurationMinutes, isActive
      FROM schedules
      WHERE doctorId = ? AND dayOfWeek = ?
    `).get(doctorId, dayOfWeek);

    if (!schedule || schedule.isActive === 0) {
      return res.json({
        success: true,
        date,
        dayOfWeek,
        available: false,
        message: `Doctor is not available on ${dayOfWeek}s.`,
        slots: [],
      });
    }

    // Generate potential slots between startTime and endTime
    const slots = [];
    const [startHour, startMin] = schedule.startTime.split(':').map(Number);
    const [endHour, endMin] = schedule.endTime.split(':').map(Number);
    const duration = schedule.slotDurationMinutes || 30;

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    const pad = (n) => String(n).padStart(2, '0');

    while (currentMinutes + duration <= endMinutes) {
      const slotStartH = Math.floor(currentMinutes / 60);
      const slotStartM = currentMinutes % 60;
      const slotEndH = Math.floor((currentMinutes + duration) / 60);
      const slotEndM = (currentMinutes + duration) % 60;

      const slotStr = `${pad(slotStartH)}:${pad(slotStartM)} - ${pad(slotEndH)}:${pad(slotEndM)}`;
      slots.push(slotStr);

      currentMinutes += duration;
    }

    // Query booked appointments for this doctor on this date
    const bookedAppointments = db.prepare(`
      SELECT timeSlot
      FROM appointments
      WHERE doctorId = ? AND appointmentDate = ? AND status != 'CANCELLED'
    `).all(doctorId, date);

    const bookedSlotSet = new Set(bookedAppointments.map((b) => b.timeSlot));

    const slotAvailability = slots.map((timeSlot) => ({
      timeSlot,
      isBooked: bookedSlotSet.has(timeSlot),
    }));

    return res.json({
      success: true,
      date,
      dayOfWeek,
      available: true,
      slots: slotAvailability,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate available slots.',
      error: error.message,
    });
  }
}

/**
 * 1. Consultation Booking: Book a consultation with a healthcare professional
 */
export function bookAppointment(req, res) {
  try {
    const patientId = req.user.id;
    const { doctorId, appointmentDate, timeSlot, reason } = req.body;

    if (!doctorId || !appointmentDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID, appointment date, and time slot are required.',
      });
    }

    // Verify doctor exists
    const doctor = db.prepare("SELECT id, name, specialty FROM users WHERE id = ? AND role = 'DOCTOR' AND status = 'ACTIVE'").get(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Healthcare professional not found or inactive.',
      });
    }

    // Check conflict
    const conflict = db.prepare(`
      SELECT id FROM appointments
      WHERE doctorId = ? AND appointmentDate = ? AND timeSlot = ? AND status != 'CANCELLED'
    `).get(doctorId, appointmentDate, timeSlot);

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'The selected time slot has already been booked. Please choose another slot.',
      });
    }

    const appointmentId = `apt-${Date.now().toString(36)}`;

    db.prepare(`
      INSERT INTO appointments (id, patientId, doctorId, appointmentDate, timeSlot, reason, status)
      VALUES (?, ?, ?, ?, ?, ?, 'SCHEDULED')
    `).run(appointmentId, patientId, doctorId, appointmentDate, timeSlot, reason || 'General Consultation');

    return res.status(201).json({
      success: true,
      message: `Confirmation: Appointment booked successfully with ${doctor.name} on ${appointmentDate} at ${timeSlot}.`,
      appointment: {
        id: appointmentId,
        doctorId,
        doctorName: doctor.name,
        specialty: doctor.specialty,
        appointmentDate,
        timeSlot,
        reason,
        status: 'SCHEDULED',
      },
    });
  } catch (error) {
    console.error('Booking error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to book consultation.',
      error: error.message,
    });
  }
}

/**
 * Get all appointments for current patient
 */
export function getPatientAppointments(req, res) {
  try {
    const patientId = req.user.id;
    const appointments = db.prepare(`
      SELECT 
        a.id,
        a.doctorId,
        d.name as doctorName,
        d.specialty as doctorSpecialty,
        d.avatarUrl as doctorAvatar,
        d.phone as doctorPhone,
        a.appointmentDate,
        a.timeSlot,
        a.reason,
        a.status,
        a.createdAt,
        c.id as consultationId
      FROM appointments a
      JOIN users d ON a.doctorId = d.id
      LEFT JOIN consultations c ON a.id = c.appointmentId
      WHERE a.patientId = ?
      ORDER BY a.appointmentDate DESC, a.timeSlot DESC
    `).all(patientId);

    return res.json({
      success: true,
      appointments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve patient appointments.',
      error: error.message,
    });
  }
}

/**
 * Cancel patient appointment
 */
export function cancelPatientAppointment(req, res) {
  try {
    const patientId = req.user.id;
    const { id } = req.params;

    const apt = db.prepare('SELECT id, status FROM appointments WHERE id = ? AND patientId = ?').get(id, patientId);
    if (!apt) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    if (apt.status === 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Completed appointments cannot be cancelled.' });
    }

    db.prepare("UPDATE appointments SET status = 'CANCELLED' WHERE id = ?").run(id);

    return res.json({
      success: true,
      message: 'Confirmation: Appointment cancelled successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment.',
      error: error.message,
    });
  }
}

/**
 * 2. Receive Medical Advice: Retrieve medical advice, diagnoses, and prescriptions
 */
export function getMedicalAdvice(req, res) {
  try {
    const patientId = req.user.id;

    const adviceRecords = db.prepare(`
      SELECT 
        c.id as consultationId,
        c.appointmentId,
        d.name as doctorName,
        d.specialty as doctorSpecialty,
        d.avatarUrl as doctorAvatar,
        a.appointmentDate,
        a.timeSlot,
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

    const formatted = adviceRecords.map((item) => ({
      ...item,
      prescriptions: item.prescriptionJson ? JSON.parse(item.prescriptionJson) : [],
    }));

    return res.json({
      success: true,
      medicalAdvice: formatted,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve medical advice.',
      error: error.message,
    });
  }
}

/**
 * 3. Health Record Management: Get personal health records (EHR)
 */
export function getHealthRecord(req, res) {
  try {
    const patientId = req.user.id;
    let record = db.prepare(`
      SELECT id, bloodGroup, allergies, chronicConditions, currentMedications, emergencyContactName, emergencyContactPhone, updatedAt
      FROM health_records
      WHERE patientId = ?
    `).get(patientId);

    if (!record) {
      record = {
        bloodGroup: 'Not Specified',
        allergies: 'None reported',
        chronicConditions: 'None reported',
        currentMedications: 'None',
        emergencyContactName: 'None',
        emergencyContactPhone: 'None',
      };
    }

    return res.json({
      success: true,
      healthRecord: record,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch health record.',
      error: error.message,
    });
  }
}

/**
 * 3. Health Record Management: Update personal health records (EHR)
 */
export function updateHealthRecord(req, res) {
  try {
    const patientId = req.user.id;
    const {
      bloodGroup,
      allergies,
      chronicConditions,
      currentMedications,
      emergencyContactName,
      emergencyContactPhone,
    } = req.body;

    const existing = db.prepare('SELECT id FROM health_records WHERE patientId = ?').get(patientId);
    const recordId = existing ? existing.id : `hr-${patientId}`;

    db.prepare(`
      INSERT INTO health_records (id, patientId, bloodGroup, allergies, chronicConditions, currentMedications, emergencyContactName, emergencyContactPhone, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(patientId) DO UPDATE SET
        bloodGroup = excluded.bloodGroup,
        allergies = excluded.allergies,
        chronicConditions = excluded.chronicConditions,
        currentMedications = excluded.currentMedications,
        emergencyContactName = excluded.emergencyContactName,
        emergencyContactPhone = excluded.emergencyContactPhone,
        updatedAt = CURRENT_TIMESTAMP
    `).run(
      recordId,
      patientId,
      bloodGroup || 'Not Specified',
      allergies || 'None reported',
      chronicConditions || 'None reported',
      currentMedications || 'None',
      emergencyContactName || 'None',
      emergencyContactPhone || 'None'
    );

    return res.json({
      success: true,
      message: 'Confirmation: Personal health records updated successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update health records.',
      error: error.message,
    });
  }
}
