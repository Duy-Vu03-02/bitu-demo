import { Queue, Job } from 'bull';
import { CANCEL_BOOKING, CONFIRM_BOOKING, CREATE_BOOKING, DEL_BOOKING } from '@common/contstant/event.booking';
import eventbus from '@common/eventbus';
import { IBooking, ICancelBooking, IConfirmBooking } from './booking.interface';
import { QueueService } from '@common/queue/queue.service';

export class BookingEvent {
    public static register = (): void => {
        eventbus.on(CREATE_BOOKING, BookingEvent.handleCreateBooking);
        eventbus.on(CONFIRM_BOOKING, BookingEvent.handleConfirmBooking);
        eventbus.on(CANCEL_BOOKING, BookingEvent.handleCancelBooking);
        eventbus.on(DEL_BOOKING, BookingEvent.handleDelBookingRedis)
    };

    public static handleCreateBooking = async (data: IBooking): Promise<void> => {
        const { idUser, idTicket } = data;
        if (idTicket && idUser) {
            // await RedisConnect.set(`${idUser}-${idTicket}`, idTicket, 300); // vo van
            await QueueService.addJob({ idUser, idTicket });
        }
    };

    public static handleCancelBooking = async (data: IBooking): Promise<void> => {
        const { idUser, idTicket } = data;
        if (idTicket && idUser) {
            // await RedisConnect.del(`${idUser}-${idTicket}`);
            await QueueService.cancelJob(data as ICancelBooking);
        }
    };

    public static handleConfirmBooking = async (data: IBooking): Promise<void> => {
        const { idUser, idTicket } = data;
        if (idTicket && idUser) {
            // await RedisConnect.del(`${idUser}-${idTicket}`);
            await QueueService.confirmJob(data as IConfirmBooking);
        }
    };

    public static handleDelBookingRedis = async(data: IBooking): Promise<void> => {
        await QueueService.delBooking(data as IBooking);
    }
}
