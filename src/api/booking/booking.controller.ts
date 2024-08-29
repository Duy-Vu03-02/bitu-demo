import { IBooking, ICancelBooking, IConfirmBooking } from '@common/booking/booking.interface';
import { BookingService } from '@common/booking/booking.service';
import { Request, Response } from 'express';

export class BookingController {
    public static bookingTicket = async (req: Request, res: Response): Promise<void> => {
        try {
            await BookingService.bookingTicket(req.body as IBooking);
        } catch (err) {
            console.log(err);
        }
    };

    public static confirmBooking = async (req: Request, res: Response): Promise<void> => {
        try {
            await BookingService.confirmBooking(req.body as IConfirmBooking);
        } catch (err) {
            console.log(err);
        }
    };

    public static cancelBooking = async (req: Request, res: Response): Promise<void> => {
        try {
            await BookingService.cancelBooking(req.body as ICancelBooking);
        } catch (err) {
            console.log(err);
        }
    };
}
