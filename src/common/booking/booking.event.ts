import { Queue, Job } from 'bull';
import { JOB_SEND_MAIL_CONFIRM as Job_Name } from '@config/job';
import { v4 as uuid } from 'uuid';

import eventbus from '@common/eventbus';
import {  IBooking, ICancelBooking, IConfirmBooking } from './booking.interface';
import { BookingJob } from '@worker/booking/booking.job';
import { UserModel } from '@common/user/user.model';
import { TicketModel } from '@common/ticket/ticket.model';
import { EventContant } from '@common/contstant/event.contant';
import { QueueService } from '@common/queue/queue.service';

export class BookingEvent {
    public static register = (): void => {
        eventbus.on(EventContant.CREATE_BOOKING, BookingEvent.handleCreateBooking);
        eventbus.on(EventContant.CANCEL_BOOKING, BookingEvent.handleCancelBooking);
        eventbus.on(EventContant.CONFIRM_BOOKING, BookingEvent.handleConfirmBooking);
    };

    public static handleCreateBooking = async (data: IBooking): Promise<void> => {
        const { idUser, idTicket } = data;
        if (idTicket && idUser) {
            await BookingJob.addJob({ idUser, idTicket });
        }
    };

    public static handleCancelBooking = async (data: IBooking): Promise<void> => {
        const { idUser, idTicket } = data;
        if (idTicket && idUser) {
            await BookingJob.delBooking(data as ICancelBooking);
        }
    };

    public static handleConfirmBooking = async (data: IConfirmBooking): Promise<void> => {
        const { idUser, idTicket, idUserBooking } = data;
        if (idTicket && idUser) {
            await BookingJob.delBooking(data as IConfirmBooking);

            const user = await UserModel.findByIdAndUpdate(idUser, {
                flight: idUserBooking,
            });
            if (user.email) {
                const ticket = await TicketModel.findById(idTicket);
                if (ticket) {
                    const queue = await QueueService.getQueue(Job_Name);
                    queue.add(
                        { email: user.email, timeStart: ticket.timeStart, from: ticket.from, to: ticket.to },
                        {
                            jobId: user.email + '-' + uuid(),
                            removeOnComplete: true,
                            removeOnFail: true,
                        },
                    );
                }
            }
        }
    };

    // public static handleAddIdBooking = async (data: IAddIdUserBooking): Promise<void> => {
    //     const user = await UserModel.findByIdAndUpdate(data.idUser, {
    //         flight: data.idUserBooking,
    //     });
    //     if (user.email) {
    //         const ticket = await TicketModel.findById(data.idTicket);
    //         if (ticket) {
    //             eventbus.emit(SEND_MAIL, {
    //                 email: user.email,
    //                 from: ticket.from.name,
    //                 to: ticket.to.name,
    //                 timeStart: ticket.timeStart,
    //             });
    //         }
    //     }
    // };
}
