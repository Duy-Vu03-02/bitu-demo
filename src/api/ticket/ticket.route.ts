import express, { Express } from 'express';
import { TicketController } from './ticket.controller';
import { AuthMiddleware } from '@api/auth/auth.midddleware';

const router = express.Router();

router.post('/all-ticket', TicketController.getAllTicket);
router.post('/my-ticket', AuthMiddleware.requireAuth, TicketController.getTicketByID);

export default router;
