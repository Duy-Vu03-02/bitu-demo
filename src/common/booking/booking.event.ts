import { Queue, Job } from 'bull';
import {
    ADD_ID_BOOKING,
    CANCEL_BOOKING,
    CONFIRM_BOOKING,
    CREATE_BOOKING,
    DEL_BOOKING,
} from '@common/contstant/event.booking';
import eventbus from '@common/eventbus';
import { IAddIdUserBooking, IBooking, ICancelBooking, IConfirmBooking } from './booking.interface';
import { BookingJob } from '@worker/booking/booking.job';
import { UserModel } from '@common/user/user.model';
import { SEND_MAIL } from '@common/contstant/event.mailer';
import { TicketModel } from '@common/ticket/ticket.model';

export class BookingEvent {
    public static register = (): void => {
        eventbus.on(CREATE_BOOKING, BookingEvent.handleCreateBooking);
        eventbus.on(CONFIRM_BOOKING, BookingEvent.handleConfirmBooking);
        eventbus.on(CANCEL_BOOKING, BookingEvent.handleCancelBooking);
        eventbus.on(DEL_BOOKING, BookingEvent.handleDelBookingRedis);
        eventbus.on(ADD_ID_BOOKING, BookingEvent.handleAddIdBooking);
    };

    public static handleCreateBooking = async (data: IBooking): Promise<void> => {
        const { idUser, idTicket } = data;
        if (idTicket && idUser) {
            // await RedisConnect.set(`${idUser}-${idTicket}`, idTicket, 300); // vo van
            await BookingJob.addJob({ idUser, idTicket });
        }
    };

    public static handleCancelBooking = async (data: IBooking): Promise<void> => {
        const { idUser, idTicket } = data;
        if (idTicket && idUser) {
            // await RedisConnect.del(`${idUser}-${idTicket}`);
            await BookingJob.delBooking(data as ICancelBooking);
        }
    };

    public static handleConfirmBooking = async (data: IBooking): Promise<void> => {
        const { idUser, idTicket } = data;
        if (idTicket && idUser) {
            // await RedisConnect.del(`${idUser}-${idTicket}`);
            await BookingJob.delBooking(data as IConfirmBooking);
        }
    };

    public static handleDelBookingRedis = async (data: IBooking): Promise<void> => {
        await BookingJob.delBooking(data as IBooking);
    };

    public static handleAddIdBooking = async (data: IAddIdUserBooking): Promise<void> => {
        const user = await UserModel.findByIdAndUpdate(data.idUser, {
            flight: data.idUserBooking,
        });
        if (user.email) {
            const ticket = await TicketModel.findById(data.idTicket);
            if (ticket) {
                eventbus.emit(SEND_MAIL, {
                    email: user.email,
                    from: ticket.from.name,
                    to: ticket.to.name,
                    timeStart: ticket.timeStart,
                });
            }
        }
    };
}
