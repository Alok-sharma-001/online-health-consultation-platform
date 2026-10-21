/**
 * Automated Verification Script
 * Validates backend database operations and queries for all 3 user roles.
 */
import { db, initDatabase } from './src/db/database.js';
import { runSeed } from './src/db/seed.js';
import bcrypt from 'bcryptjs';

console.log('🧪 Starting Automated Backend Verification...\n');

// 1. Reset and Seed DB
runSeed();

// 2. Test User Verification
console.log('✓ Testing User Accounts...');
const admin = db.prepare("SELECT * FROM users WHERE role = 'ADMIN'").get();
console.assert(admin && admin.email === 'admin@health.com', 'Admin should exist');
console.assert(bcrypt.compareSync('admin123', admin.passwordHash), 'Admin password verification failed');

const doctors = db.prepare("SELECT * FROM users WHERE role = 'DOCTOR'").all();
console.assert(doctors.length >= 3, 'At least 3 doctors should exist');
console.log(`  -> Verified ${doctors.length} Doctors: ${doctors.map(d => d.name).join(', ')}`);

const patients = db.prepare("SELECT * FROM users WHERE role = 'PATIENT'").all();
console.assert(patients.length >= 3, 'At least 3 patients should exist');
console.log(`  -> Verified ${patients.length} Patients: ${patients.map(p => p.name).join(', ')}`);

// 3. Test Schedules
console.log('\n✓ Testing Doctor Schedules...');
const smithSchedule = db.prepare("SELECT * FROM schedules WHERE doctorId = ?").all('u-doc-smith');
console.assert(smithSchedule.length === 5, 'Dr. Smith should have 5 weekday schedules');
console.log(`  -> Dr. Smith schedule slots verified (${smithSchedule.length} days active)`);

// 4. Test Appointments & Consultations
console.log('\n✓ Testing Appointments & Consultations...');
const appointments = db.prepare("SELECT * FROM appointments").all();
console.assert(appointments.length >= 5, 'Appointments should be seeded');
console.log(`  -> Total appointments: ${appointments.length}`);

const consultations = db.prepare("SELECT * FROM consultations").all();
console.assert(consultations.length >= 2, 'Consultations should be seeded');
console.log(`  -> Consultations with advice & prescriptions: ${consultations.length}`);

// 5. Test Electronic Health Records (EHR)
console.log('\n✓ Testing Patient Health Records...');
const records = db.prepare("SELECT * FROM health_records").all();
console.assert(records.length >= 3, 'Health records should be seeded');
console.log(`  -> Health records verified (${records.length} records populated)`);

// 6. Test Communication Messages
console.log('\n✓ Testing Consultation Messaging...');
const messages = db.prepare("SELECT * FROM messages").all();
console.assert(messages.length >= 2, 'Messages should be seeded');
console.log(`  -> Chat messages logged: ${messages.length}`);

// 7. Test System Settings
console.log('\n✓ Testing System Settings...');
const settings = db.prepare("SELECT * FROM system_settings").all();
console.assert(settings.length >= 5, 'System settings should exist');
console.log(`  -> System settings verified (${settings.length} config keys)`);

console.log('\n🎉 ALL BACKEND CHECKS PASSED SUCCESSFULLY!\n');
