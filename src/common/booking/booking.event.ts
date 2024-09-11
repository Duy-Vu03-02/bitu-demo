import { Queue, Job } from 'bull';
import { v4 as uuid } from 'uuid';
import eventbus from '@common/eventbus';
import { IBooking, IConfirmBooking } from './booking.interface';
import { UserModel } from '@common/user/user.model';
import { TicketModel } from '@common/ticket/ticket.model';
import { EventContant } from '@common/contstant/event.contant';
import { QueueService } from '@common/queue/queue.service';
import { JobContant } from '@common/contstant/job.contant';

export class BookingEvent {
    private static delayJOb: number = 1000 * 60 * 5;

    public static register = (): void => {
        eventbus.on(EventContant.CREATE_BOOKING, BookingEvent.handleCreateBooking);
        eventbus.on(EventContant.CANCEL_BOOKING, BookingEvent.handleCancelBooking);
        eventbus.on(EventContant.CONFIRM_BOOKING, BookingEvent.handleConfirmBooking);
    };

    public static handleCreateBooking = async (data: IBooking): Promise<void> => {
        const { idUser, idTicket } = data;
        if (idTicket && idUser) {
            const currentJob = await QueueService.getQueue(JobContant.JOB_BOOKING);
            const idJob = BookingEvent.genderIdJob({ idUser, idTicket });
            await currentJob.add(
                { idUser, idTicket },
                {
                    delay: BookingEvent.delayJOb,
                    jobId: idJob,
                    removeOnComplete: true,
                    removeOnFail: true,
                },
            );
        }
    };

    public static handleCancelBooking = async (data: IBooking): Promise<void> => {
        const { idUser, idTicket } = data;
        if (idTicket && idUser) {
            const currentJob = await QueueService.getQueue(JobContant.JOB_BOOKING);
            const idJob = BookingEvent.genderIdJob({ idUser, idTicket });
            const currentBooking = await currentJob.getJob(idJob);

            if (currentBooking) {
                await currentBooking.remove();
            }
        }
    };

    public static handleConfirmBooking = async (data: IConfirmBooking): Promise<void> => {
        const { idUser, idTicket } = data;
        if (idTicket && idUser) {
            const currentJob = await QueueService.getQueue(JobContant.JOB_BOOKING);
            const idJob = BookingEvent.genderIdJob({ idUser, idTicket });
            const currentBooking = await currentJob.getJob(idJob);

            if (currentBooking) {
                await currentBooking.remove();
            }

            const user = await UserModel.findById(idUser);
            if (user.email) {
                const ticket = await TicketModel.findById(idTicket);
                if (ticket) {
                    const queue = await QueueService.getQueue(JobContant.JOB_SEND_MAIL_CONFIRM);
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

    public static genderIdJob = (job: IBooking): string => {
        return job.idUser + '-' + job.idTicket;
    };
}
