/**
 * Database Seed Script
 * Pre-populates the SQLite database with realistic healthcare data:
 * - Admin, Doctors, and Patients
 * - Doctor availability schedules
 * - Active & completed appointments
 * - Clinical consultations and prescriptions
 * - Patient health records (EHR)
 * - Consultation messages
 * - Platform system settings
 */
import bcrypt from 'bcryptjs';
import { db, initDatabase } from './database.js';

export function runSeed() {
  console.log('[Seed] Seeding database with initial data...');

  // Ensure tables exist
  initDatabase();

  // Clear existing data in reverse order of foreign key dependencies
  db.exec(`
    DELETE FROM messages;
    DELETE FROM consultations;
    DELETE FROM appointments;
    DELETE FROM health_records;
    DELETE FROM schedules;
    DELETE FROM system_settings;
    DELETE FROM users;
  `);

  const saltRounds = 10;
  const adminPasswordHash = bcrypt.hashSync('admin123', saltRounds);
  const doctorPasswordHash = bcrypt.hashSync('doctor123', saltRounds);
  const patientPasswordHash = bcrypt.hashSync('patient123', saltRounds);

  // 1. Seed Users
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, passwordHash, role, specialty, phone, status, avatarUrl)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Admin
  insertUser.run(
    'u-admin-01',
    'Platform Administrator',
    'admin@health.com',
    adminPasswordHash,
    'ADMIN',
    null,
    '+1 800-555-0100',
    'ACTIVE',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  );

  // Doctors
  insertUser.run(
    'u-doc-smith',
    'Dr. Robert Smith, MD',
    'dr.smith@health.com',
    doctorPasswordHash,
    'DOCTOR',
    'Cardiology',
    '+1 555-0101',
    'ACTIVE',
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'
  );
  insertUser.run(
    'u-doc-patel',
    'Dr. Priya Patel, MD',
    'dr.patel@health.com',
    doctorPasswordHash,
    'DOCTOR',
    'Dermatology',
    '+1 555-0102',
    'ACTIVE',
    'https://images.unsplash.com/photo-1594824813583-4a11b7d519b7?w=150&auto=format&fit=crop&q=80'
  );
  insertUser.run(
    'u-doc-jenkins',
    'Dr. Sarah Jenkins, MD',
    'dr.sarah@health.com',
    doctorPasswordHash,
    'DOCTOR',
    'General Medicine',
    '+1 555-0103',
    'ACTIVE',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'
  );

  // Patients
  insertUser.run(
    'u-patient-john',
    'John Doe',
    'john.doe@patient.com',
    patientPasswordHash,
    'PATIENT',
    null,
    '+1 555-0123',
    'ACTIVE',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  );
  insertUser.run(
    'u-patient-jane',
    'Jane Roe',
    'jane.roe@patient.com',
    patientPasswordHash,
    'PATIENT',
    null,
    '+1 555-0124',
    'ACTIVE',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
  );
  insertUser.run(
    'u-patient-alex',
    'Alex Kim',
    'alex.kim@patient.com',
    patientPasswordHash,
    'PATIENT',
    null,
    '+1 555-0125',
    'ACTIVE',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  );

  // 2. Seed Doctor Schedules (Monday through Friday, 09:00 - 17:00)
  const insertSchedule = db.prepare(`
    INSERT INTO schedules (id, doctorId, dayOfWeek, startTime, endTime, slotDurationMinutes, isActive)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const doctors = ['u-doc-smith', 'u-doc-patel', 'u-doc-jenkins'];

  let schedIdx = 1;
  doctors.forEach((docId) => {
    days.forEach((day) => {
      insertSchedule.run(
        `sch-${schedIdx++}`,
        docId,
        day,
        '09:00',
        '17:00',
        30,
        1
      );
    });
  });

  // 3. Seed Patient Health Records
  const insertHealthRecord = db.prepare(`
    INSERT INTO health_records (id, patientId, bloodGroup, allergies, chronicConditions, currentMedications, emergencyContactName, emergencyContactPhone)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertHealthRecord.run(
    'hr-john',
    'u-patient-john',
    'O+',
    'Penicillin, Peanuts',
    'Mild Hypertension',
    'Lisinopril 10mg once daily',
    'Mary Doe (Spouse)',
    '+1 555-0129'
  );
  insertHealthRecord.run(
    'hr-jane',
    'u-patient-jane',
    'A-',
    'Sulfa antibiotics',
    'Seasonal Asthma, Eczema',
    'Albuterol inhaler PRN',
    'David Roe (Brother)',
    '+1 555-0130'
  );
  insertHealthRecord.run(
    'hr-alex',
    'u-patient-alex',
    'B+',
    'None reported',
    'Type 2 Diabetes (Well-controlled)',
    'Metformin 500mg twice daily',
    'Linda Kim (Spouse)',
    '+1 555-0131'
  );

  // 4. Seed Appointments
  const insertAppointment = db.prepare(`
    INSERT INTO appointments (id, patientId, doctorId, appointmentDate, timeSlot, reason, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Past completed appointments
  insertAppointment.run(
    'apt-past-01',
    'u-patient-john',
    'u-doc-smith',
    '2026-10-14',
    '10:00 - 10:30',
    'Experiencing occasional palpitations after exercise',
    'COMPLETED'
  );
  insertAppointment.run(
    'apt-past-02',
    'u-patient-jane',
    'u-doc-patel',
    '2026-10-18',
    '11:00 - 11:30',
    'Persistent skin rash on right forearm with pruritus',
    'COMPLETED'
  );

  // Upcoming scheduled appointments
  insertAppointment.run(
    'apt-upcoming-01',
    'u-patient-john',
    'u-doc-smith',
    '2026-10-23',
    '09:30 - 10:00',
    'Cardiovascular follow-up and ECG review',
    'SCHEDULED'
  );
  insertAppointment.run(
    'apt-upcoming-02',
    'u-patient-alex',
    'u-doc-jenkins',
    '2026-10-24',
    '14:00 - 14:30',
    'Quarterly HbA1c review and general physical checkup',
    'SCHEDULED'
  );
  insertAppointment.run(
    'apt-upcoming-03',
    'u-patient-jane',
    'u-doc-smith',
    '2026-10-25',
    '15:00 - 15:30',
    'Shortness of breath evaluation',
    'SCHEDULED'
  );

  // Cancelled appointment
  insertAppointment.run(
    'apt-cancelled-01',
    'u-patient-alex',
    'u-doc-patel',
    '2026-10-12',
    '16:00 - 16:30',
    'Skin lesion check - patient rescheduled',
    'CANCELLED'
  );

  // 5. Seed Consultations & Prescriptions for Completed Appointments
  const insertConsultation = db.prepare(`
    INSERT INTO consultations (id, appointmentId, doctorId, patientId, diagnosis, medicalAdvice, prescriptionJson, followUpDate)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const rxJohn = JSON.stringify([
    {
      medicine: 'Metoprolol Tartrate',
      dosage: '25mg',
      frequency: 'Twice daily after meals',
      duration: '30 days',
      instructions: 'Do not discontinue abruptly.'
    },
    {
      medicine: 'Omega-3 Fish Oil',
      dosage: '1000mg',
      frequency: 'Once daily with dinner',
      duration: '60 days',
      instructions: 'Heart health supplement.'
    }
  ]);

  insertConsultation.run(
    'con-01',
    'apt-past-01',
    'u-doc-smith',
    'u-patient-john',
    'Benign Sinus Tachycardia triggered by caffeine & exertion',
    'Reduce caffeine intake to <= 1 cup per day. Ensure 2.5L daily hydration. Perform 20 mins light aerobic exercise.',
    rxJohn,
    '2026-11-14'
  );

  const rxJane = JSON.stringify([
    {
      medicine: 'Hydrocortisone 1% Cream',
      dosage: 'Thin layer',
      frequency: 'Twice daily on affected area',
      duration: '10 days',
      instructions: 'Avoid contact with eyes.'
    },
    {
      medicine: 'Cetirizine HCl',
      dosage: '10mg',
      frequency: 'Once daily at bedtime',
      duration: '7 days',
      instructions: 'May cause mild drowsiness.'
    }
  ]);

  insertConsultation.run(
    'con-02',
    'apt-past-02',
    'u-doc-patel',
    'u-patient-jane',
    'Contact Dermatitis (probable allergic reaction to detergent)',
    'Switch to hypoallergenic fragrance-free laundry detergents. Avoid hot showers and moisturize immediately after bathing.',
    rxJane,
    '2026-11-01'
  );

  // 6. Seed Consultation Messages
  const insertMessage = db.prepare(`
    INSERT INTO messages (id, appointmentId, senderId, receiverId, content, sentAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertMessage.run(
    'msg-01',
    'apt-upcoming-01',
    'u-patient-john',
    'u-doc-smith',
    'Hello Dr. Smith, I have been logging my resting pulse every morning as advised. Should I bring the log to our appointment?',
    '2026-10-21 09:15:00'
  );
  insertMessage.run(
    'msg-02',
    'apt-upcoming-01',
    'u-doc-smith',
    'u-patient-john',
    'Yes, John! That will be very useful for adjusting your dosage during our session on the 23rd.',
    '2026-10-21 09:42:00'
  );

  // 7. Seed System Settings
  const insertSetting = db.prepare(`
    INSERT INTO system_settings (key, value, description)
    VALUES (?, ?, ?)
  `);

  insertSetting.run('platformName', 'CurePulse Health Consultation Platform', 'Public platform name displayed in header and documents.');
  insertSetting.run('supportEmail', 'support@curepulse-telehealth.org', 'Official helpdesk and contact email.');
  insertSetting.run('defaultSlotDuration', '30', 'Standard appointment slot duration in minutes.');
  insertSetting.run('maxAdvanceBookingDays', '30', 'Maximum days ahead patients can book appointments.');
  insertSetting.run('emergencyHelpline', '+1 800-555-CURE', '24/7 urgent medical hotline.');
  insertSetting.run('enableNotifications', 'true', 'System-wide push and email notifications toggle.');

  console.log('[Seed] Database populated successfully!');
  console.log('--- DEMO CREDENTIALS ---');
  console.log('Admin:    admin@health.com / admin123');
  console.log('Doctor:   dr.smith@health.com / doctor123');
  console.log('Doctor:   dr.patel@health.com / doctor123');
  console.log('Patient:  john.doe@patient.com / patient123');
  console.log('Patient:  jane.roe@patient.com / patient123');
}

// If executed directly via CLI
if (process.argv[1]?.endsWith('seed.js')) {
  runSeed();
}
