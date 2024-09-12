import express from 'express';
import { TicketController } from './ticket.controller';

const router = express.Router();

router.post('/all-ticket', TicketController.getAllTicket);

export default router;
