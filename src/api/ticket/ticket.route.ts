import express, { Express } from 'express';
import { TicketController } from './ticket.controller';
import { AuthMiddleware } from '@api/auth/auth.midddleware';

const router = express.Router();

router.post('/all-ticket', TicketController.getAllTicket);

export default router;
