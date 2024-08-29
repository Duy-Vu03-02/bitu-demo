import express, { Request, Response } from 'express';
import userRouter from './user/user.route';
import ticketRouter from './ticket/ticket.route';
import bookingRouter from './booking/booking.route';

const router = express.Router();

router.get('/test', (req: Request, res: Response) => {
    return res.status(200).json({ mess: 'ok' });
});

router.use('/user', userRouter);
router.use('/ticket', ticketRouter);
router.use('/booking', bookingRouter);

export default router;
