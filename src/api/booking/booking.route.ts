import express from 'express';
import { BookingController } from './booking.controller';

const router = express.Router();

router.post('/new-booking', BookingController.bookingTicket);
router.post('/confirm-booking', BookingController.confirmBooking);
router.post('/candel-booking', BookingController.cancelBooking);

export default router;
