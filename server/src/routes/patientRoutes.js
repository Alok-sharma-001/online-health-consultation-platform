/**
 * Patient Routes
 */
import { Router } from 'express';
import {
  getDoctorsList,
  getAvailableSlots,
  bookAppointment,
  getPatientAppointments,
  cancelPatientAppointment,
  getMedicalAdvice,
  getHealthRecord,
  updateHealthRecord,
} from '../controllers/patientController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

// Public / Authenticated read doctor info
router.get('/doctors', getDoctorsList);
router.get('/doctors/:doctorId/slots', getAvailableSlots);

// Patient protected actions
router.use(verifyToken, requireRole('PATIENT'));

// 1. Consultation Booking & Management
router.post('/appointments', bookAppointment);
router.get('/appointments', getPatientAppointments);
router.put('/appointments/:id/cancel', cancelPatientAppointment);

// 2. Receive Medical Advice
router.get('/medical-advice', getMedicalAdvice);

// 3. Health Record Management
router.get('/health-record', getHealthRecord);
router.put('/health-record', updateHealthRecord);

export default router;
