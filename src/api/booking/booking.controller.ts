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
            res.sendJson();
        } catch (err) {
            res.sendJson({
                status: statusCode.SERVER_ERROR,
                message: err.message,
            });
        }
    };

    public static confirmBooking = async (req: Request, res: Response): Promise<void> => {
        try {
            await BookingService.confirmBooking(req.body as IConfirmBooking);
            res.sendJson();
        } catch (err) {
            res.sendJson({
                message: err.message,

                status: statusCode.SERVER_ERROR,
            });
        }
    };

    public static cancelBooking = async (req: Request, res: Response): Promise<void> => {
        try {
            await BookingService.cancelBooking(req.body as ICancelBooking);
            res.sendJson();
        } catch (err) {
            res.sendJson({
                message: err.message,

                status: statusCode.SERVER_ERROR,
            });
        }
    };

    public static allBookingByUser = async (req: Request, res: Response): Promise<any> => {
        try {
            const listBookingTicket = await BookingService.allBookingByUser(req.body as IBookingIdUser);
            res.sendJson({
                data: listBookingTicket,
            });
        } catch (err) {
            res.sendJson({
                status: statusCode.SERVER_ERROR,
            });
        }
    };
}
