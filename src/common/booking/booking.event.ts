import { BookingService } from '@common/booking/booking.service';
import { CANCEL_BOOKING, CONFIRM_BOOKING, CREATE_BOOKING } from '@common/contstant/event.booking';
import eventbus from '@common/eventbus';
import { IBooking, IConfirmBooking } from './booking.interface';
import { RedisConnect } from '@common/infrastructure/redis';
import { BookingController } from '@api/booking/booking.controller';

export class BookingEvent {
    public static register = async (): Promise<void> => {
        eventbus.on(CREATE_BOOKING, BookingEvent.handleCreateBooking);
        eventbus.on(CONFIRM_BOOKING, BookingEvent.handleConfirmBooking);
        eventbus.on(CANCEL_BOOKING, BookingEvent.handleCancelBooking);
    };

    public static handleCreateBooking = async (data: IBooking): Promise<void> => {
        const { idUser, idTicket } = data;
        if (idTicket && idUser) {
            await RedisConnect.set(`${idUser}-${idTicket}`, idTicket, 300);
        }
    };

    public static handleCancelBooking = async (data: IBooking): Promise<void> => {
        const { idUser, idTicket } = data;
        if (idTicket && idUser) {
            await RedisConnect.del(`${idUser}-${idTicket}`);
        }
    };

    public static handleConfirmBooking = async (data: IBooking): Promise<void> => {
        const { idUser, idTicket } = data;
        if (idTicket && idUser) {
            await RedisConnect.del(`${idUser}-${idTicket}`);
            // await BookingService.confirmBooking(data as IConfirmBooking);
        }
    };
}
