/**
 * Administrator Routes
 * Protected by verifyToken and requireRole('ADMIN')
 */
import { Router } from 'express';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllAppointments,
  updateAppointmentStatus,
  getSystemSettings,
  updateSystemSettings,
  getSystemAnalytics,
} from '../controllers/adminController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

// Apply admin guard to all admin routes
router.use(verifyToken, requireRole('ADMIN'));

// 1. User Management
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// 2. Appointment Management
router.get('/appointments', getAllAppointments);
router.put('/appointments/:id', updateAppointmentStatus);

// 3. System Settings
router.get('/settings', getSystemSettings);
router.put('/settings', updateSystemSettings);

// 4. System Analytics Dashboard
router.get('/analytics', getSystemAnalytics);

export default router;
