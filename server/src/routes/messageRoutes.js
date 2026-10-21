/**
 * Communication Tools / Messages Routes
 */
import { Router } from 'express';
import { sendMessage, getAppointmentMessages } from '../controllers/messageController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.use(verifyToken);

router.post('/', sendMessage);
router.get('/:appointmentId', getAppointmentMessages);

export default router;
