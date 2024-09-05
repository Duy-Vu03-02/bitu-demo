import {
    IAllBookingUser,
    IBooking,
    IBookingIdUser,
    ICancelBooking,
    IConfirmBooking,
} from '@common/booking/booking.interface';
import { BookingService } from '@common/booking/booking.service';
import { statusCode } from '@config/errors';
import { Request, Response } from 'express';

export class BookingController {
    public static bookingTicket = async (req: Request, res: Response): Promise<void> => {
        try {
            await BookingService.bookingTicket(req.body as IBooking);
            res.status(statusCode.OK);
        } catch (err) {
            console.error(err);
        }
    };

    public static confirmBooking = async (req: Request, res: Response): Promise<void> => {
        try {
            await BookingService.confirmBooking(req.body as IConfirmBooking);
            res.status(statusCode.OK);
        } catch (err) {
            console.error(err);
        }
    };

    public static cancelBooking = async (req: Request, res: Response): Promise<void> => {
        try {
            await BookingService.cancelBooking(req.body as ICancelBooking);
            res.status(statusCode.OK);
        } catch (err) {
            console.log(err);
        }
    };

    public static allBookingByUser = async (req: Request, res: Response): Promise<any> => {
        try {
            const listBookingTicket = await BookingService.allBookingByUser(req.body as IBookingIdUser);
            res.status(statusCode.OK).json(listBookingTicket);
        } catch (err) {
            console.error(err);
        }
    };
}
