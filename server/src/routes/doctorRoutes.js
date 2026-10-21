/**
 * Healthcare Professional (Doctor) Routes
 * Protected by verifyToken and requireRole('DOCTOR')
 */
import { Router } from 'express';
import {
  getDoctorSchedule,
  updateDoctorSchedule,
  getDoctorAppointments,
  provideConsultation,
  getPatientHistory,
} from '../controllers/doctorController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

// Doctor routes guard
router.use(verifyToken, requireRole('DOCTOR'));

// 1. Schedule Management
router.get('/schedule', getDoctorSchedule);
router.post('/schedule', updateDoctorSchedule);

// 2. Consultation Management & Provision
router.get('/consultations', getDoctorAppointments);
router.post('/consultations', provideConsultation);

// 3. Patient Record Access
router.get('/patients/:patientId/history', getPatientHistory);

export default router;
