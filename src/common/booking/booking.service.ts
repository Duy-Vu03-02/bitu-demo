import { IBooking, IBookingIdUser, ICancelBooking, IConfirmBooking, IResponseBookingUser } from './booking.interface';
import eventbus from '@common/eventbus';
import { UserModel } from '@common/user/user.model';
import { TicketContant } from '@common/contstant/ticket.contant';
import { TicketModel } from '@common/ticket/ticket.model';
import { BookingJob } from '@worker/booking/booking.job';
import { UserBookingModel } from '@common/userBooking/userBooking.model';
import { IUserBooking } from '@common/userBooking/userBooking.interface';
import { EventContant } from '@common/contstant/event.contant';
import { BookingEvent } from './booking.event';
import { QueueService } from '@common/queue/queue.service';
import { JobContant } from '@common/contstant/job.contant';

export class BookingService {
    public static bookingTicket = async (data: IBooking): Promise<void> => {
        try {
            const { idUser, idTicket } = data;
            if (idUser && idTicket) {
                eventbus.emit(EventContant.CREATE_BOOKING, { idUser, idTicket });
            }
        } catch (err) {
            console.error(err);
        }
    };

    public static confirmBooking = async (data: IConfirmBooking): Promise<void> => {
        try {
            const { idUser, idTicket } = data;
            if (idUser && idTicket) {
                const newUserBooking: IUserBooking = await UserBookingModel.create({
                    idUser,
                    tickets: [
                        {
                            idTicket,
                            state: TicketContant.PAYMENTED,
                        },
                    ],
                });

                eventbus.emit(EventContant.CONFIRM_BOOKING, {
                    idUserBooking: newUserBooking._id,
                    idUser: idUser,
                    idTicket,
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    public static cancelBooking = async (data: ICancelBooking): Promise<void> => {
        try {
            const { idUser, idTicket } = data;
            if (idUser && idTicket) {
                await UserModel.findOneAndUpdate(
                    {
                        _id: idUser,
                        'flight.idTicket': idTicket,
                    },
                    {
                        $set: {
                            'flight.$.state': TicketContant.CANCELED,
                        },
                    },
                );
                eventbus.emit(EventContant.CANCEL_BOOKING, { idUser, idTicket });
            }
        } catch (err) {
            console.error(err);
        }
    };

    public static allBookingByUser = async (data: IBookingIdUser): Promise<IResponseBookingUser[]> => {
        try {
            const { idUser } = data;
            if (idUser) {
                const user = await UserModel.findById(idUser);
                let listTicket: any[];
                if (user && user?.flight) {
                    const flight = await UserBookingModel.findOne({ idUser: user._id })
                        .populate({
                            path: 'tickets',
                            populate: {
                                path: 'idTicket',
                            },
                        })
                        .lean();

                    if (flight && flight?.tickets?.length > 0) {
                        const listFlights = flight.tickets;
                        listTicket = await Promise.all(
                            listFlights.map((item) => {
                                let ticket = Object.assign({}, item.idTicket);
                                if (ticket) {
                                    return {
                                        ...ticket['_doc'],
                                        id: ticket['_doc']['_id'].toHexString(),
                                        state: item.state,
                                        payment: false,
                                        cancel: item.state === TicketContant.PAYMENTED,
                                    };
                                }
                            }),
                        );
                    }
                }

                // Get trong redis
                const listSoft = await BookingService.getJobByIdUser(data as IBookingIdUser);
                if (listSoft.length <= 0) {
                    return listTicket;
                }
                const listSoftId = await Promise.all(listSoft.map((item) => item.idTicket));
                const listSoftBooking: IResponseBookingUser[] = await Promise.all(
                    listSoftId.map(async (item) => {
                        return {
                            ...(await TicketModel.findById(item)).toJSON(),
                            state: TicketContant.NOT_CONFIRM,
                            payment: true,
                            cancel: true,
                        };
                    }),
                );
                return [...listSoftBooking, ...listTicket];
            }
        } catch (err) {
            console.error(err);
        }
    };

    public static getJobByIdUser = async (job: IBookingIdUser): Promise<IBooking[]> => {
        const queuedJobs = await (await QueueService.getQueue(JobContant.JOB_BOOKING)).getJobs(['delayed', 'paused', 'waiting', 'active']);
        const listJobs = await Promise.all(
            queuedJobs.map((item) => {
                if (item.id.toString().includes(job.idUser)) {
                    return item.data;
                }
            }),
        );
        return listJobs;
    };
}
