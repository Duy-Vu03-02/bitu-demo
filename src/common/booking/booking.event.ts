import { Queue } from 'bull';
import { CANCEL_BOOKING, CONFIRM_BOOKING, CREATE_BOOKING } from '@common/contstant/event.booking';
import eventbus from '@common/eventbus';
import { IBooking, IConfirmBooking } from './booking.interface';
import { RedisConnect } from '@common/infrastructure/redis';
import { QueueService } from '@common/queue/queue.service';

export class BookingEvent {
    public static register = (): void => {
        eventbus.on(CREATE_BOOKING, BookingEvent.handleCreateBooking);
        eventbus.on(CONFIRM_BOOKING, BookingEvent.handleConfirmBooking);
        eventbus.on(CANCEL_BOOKING, BookingEvent.handleCancelBooking);
    };

    public static handleCreateBooking = async (data: IBooking): Promise<void> => {
        const { idUser, idTicket } = data;
        if (idTicket && idUser) {
            // await RedisConnect.set(`${idUser}-${idTicket}`, idTicket, 300); // vo van
            QueueService.addJob({ idUser, idTicket });
            QueueService.getQueue(idUser);
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
