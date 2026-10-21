/**
 * Database Module
 * Initializes SQLite database connection using better-sqlite3 and sets up schema tables.
 */
import Database from 'better-sqlite3';
import { config } from '../config/config.js';

// Open SQLite database file with foreign keys enabled
export const db = new Database(config.dbPath);
db.pragma('foreign_keys = ON');

/**
 * Initialize all database tables if they do not already exist
 */
export function initDatabase() {
  // 1. Users Table (Admin, Doctor, Patient)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      passwordHash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('ADMIN', 'DOCTOR', 'PATIENT')),
      specialty TEXT,
      phone TEXT,
      avatarUrl TEXT,
      status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'INACTIVE')),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Healthcare Professional Schedules Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS schedules (
      id TEXT PRIMARY KEY,
      doctorId TEXT NOT NULL,
      dayOfWeek TEXT NOT NULL,
      startTime TEXT NOT NULL,
      endTime TEXT NOT NULL,
      slotDurationMinutes INTEGER NOT NULL DEFAULT 30,
      isActive INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY(doctorId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 3. Appointments Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      patientId TEXT NOT NULL,
      doctorId TEXT NOT NULL,
      appointmentDate TEXT NOT NULL,
      timeSlot TEXT NOT NULL,
      reason TEXT,
      status TEXT NOT NULL DEFAULT 'SCHEDULED' CHECK(status IN ('SCHEDULED', 'COMPLETED', 'CANCELLED')),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(patientId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(doctorId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 4. Consultations & Medical Advice Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS consultations (
      id TEXT PRIMARY KEY,
      appointmentId TEXT UNIQUE NOT NULL,
      doctorId TEXT NOT NULL,
      patientId TEXT NOT NULL,
      diagnosis TEXT NOT NULL,
      medicalAdvice TEXT NOT NULL,
      prescriptionJson TEXT,
      followUpDate TEXT,
      completedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(appointmentId) REFERENCES appointments(id) ON DELETE CASCADE,
      FOREIGN KEY(doctorId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(patientId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 5. Patient Electronic Health Records (EHR) Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS health_records (
      id TEXT PRIMARY KEY,
      patientId TEXT UNIQUE NOT NULL,
      bloodGroup TEXT,
      allergies TEXT,
      chronicConditions TEXT,
      currentMedications TEXT,
      emergencyContactName TEXT,
      emergencyContactPhone TEXT,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(patientId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 6. Communication / Consultation Messages Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      appointmentId TEXT NOT NULL,
      senderId TEXT NOT NULL,
      receiverId TEXT NOT NULL,
      content TEXT NOT NULL,
      sentAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(appointmentId) REFERENCES appointments(id) ON DELETE CASCADE,
      FOREIGN KEY(senderId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(receiverId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 7. System-Wide Settings Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      description TEXT,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('[Database] Schema initialized successfully.');
}
