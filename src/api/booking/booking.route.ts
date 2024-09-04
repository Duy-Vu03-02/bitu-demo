import express from 'express';
import { BookingController } from './booking.controller';
import { AuthMiddleware } from '@api/auth/auth.midddleware';

const router = express.Router();

router.post('/new-booking', AuthMiddleware.requireAuth, BookingController.bookingTicket);
router.post('/confirm-booking', AuthMiddleware.requireAuth, BookingController.confirmBooking);
router.post('/candel-booking', AuthMiddleware.requireAuth, BookingController.cancelBooking);
router.post('/all-booking', AuthMiddleware.requireAuth, BookingController.allBookingByUser);

export default router;
