import { ErrorCode } from './../../../../demo-multiple-entrypoint-backend/src/config/errors';
import {
    IAllBookingUser,
    IBooking,
    IBookingIdUser,
    ICancelBooking,
    IConfirmBooking,
} from '@common/booking/booking.interface';
import { BookingService } from '@common/booking/booking.service';
import { NextFunction, Request, Response } from 'express';

export class BookingController {
    public static bookingTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const booking = await BookingService.bookingTicket(req.body as IBooking);
            res.sendJson({
                data: booking,
            });
        } catch (err) {
            next(err);
        }
    };

    public static confirmBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const booking = await BookingService.confirmBooking(req.body as IConfirmBooking);
            res.sendJson({
                data: booking,
            });
        } catch (err) {
            next(err);
        }
    };

    public static cancelBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            console.log(req.body);
            const booking = await BookingService.cancelBooking(req.body as ICancelBooking);
            res.sendJson({
                data: booking,
            });
        } catch (err) {
            next(err);
        }
    };

    public static allBookingByUser = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
        try {
            const listBookingTicket = await BookingService.allBookingByUser(req.body as IBookingIdUser);
            res.sendJson({
                data: listBookingTicket,
            });
        } catch (err) {
            next(err);
        }
    };
}
