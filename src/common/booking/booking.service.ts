import eventbus from '@common/eventbus';
import { IBooking, IBookingIdUser, ICancelBooking, IConfirmBooking, IResponseBookingUser } from './booking.interface';
import { TicketContant } from '@common/contstant/ticket.contant';
import { TicketModel } from '@common/ticket/ticket.model';
import { UserBookingModel } from '@common/userBooking/userBooking.model';
import { EventContant } from '@common/contstant/event.contant';
import { QueueService } from '@common/queue/queue.service';
import { JobContant } from '@common/contstant/job.contant';
import { APIError } from '@common/error/api.error';
import { statusCode } from '@config/errors';
import { BookingEvent } from './booking.event';

export class BookingService {
    private static delayJOb: number = 1000 * 60 * 5;

    public static bookingTicket = async (data: IBooking): Promise<void> => {
        try {
            const { idUser, idTicket } = data;
            if (idUser && idTicket) {
                const ticket = (await TicketModel.findById(idTicket)).transform();

                if(ticket.quantity > 0){
                    const currentJob = await QueueService.getQueue(JobContant.JOB_BOOKING);
                    const idJob = BookingEvent.genderIdJob({ idUser, idTicket });
                    await currentJob.add(
                        { idUser, idTicket },
                        {
                            delay: BookingService.delayJOb,
                            jobId: idJob,
                            removeOnComplete: true,
                            removeOnFail: true,
                        },
                    );
                    return;
                }
            }

            throw new APIError({
                message: 'Tickets are sold out',
                status: statusCode.SERVER_AUTH_ERROR,
                errorCode: statusCode.SERVER_AUTH_ERROR,
            });
        } catch (err) {
            throw  err;
        }
    };

    public static confirmBooking = async (data: IConfirmBooking): Promise<void> => {
        try {
            const { idUser, idTicket } = data;
            if (idUser && idTicket) {
                const userBooking = await UserBookingModel.findOne({
                    idUser,
                });
                const ticket = (await TicketModel.findById(idTicket)).transform();

                if(ticket.quantity >= 0){
                    if (userBooking ) {
                        const flight = await UserBookingModel.findOneAndUpdate(
                            {
                                idUser,
                            },
                            {
                                $push: {
                                    tickets: {
                                        idTicket,
                                        state: TicketContant.PAYMENTED,
                                    },
                                },
                            },
                            { new: true },
                        );
                    } else {
                        const newFlight = await UserBookingModel.create({
                            idUser,
                            tickets: [
                                {
                                    idTicket,
                                    state: TicketContant.PAYMENTED,
                                },
                            ],
                        });
                    }
    
                    eventbus.emit(EventContant.CONFIRM_BOOKING, {
                        idUser,
                        idTicket,
                    });
                    return;
                }
            }

            throw new APIError({
                message: 'Tickets are sold out',
                status: statusCode.SERVER_AUTH_ERROR,
                errorCode: statusCode.SERVER_AUTH_ERROR,
            });
        } catch (err) {
            throw err;
        }
    };

    public static cancelBooking = async (data: ICancelBooking): Promise<void> => {
        try {
            const { idUser, idTicketUserBooking, idTicket } = data;
            if (idUser && idTicketUserBooking && idTicket) {
                const result = await UserBookingModel.findOneAndUpdate(
                    {
                        idUser,
                        'tickets._id': idTicketUserBooking,
                    },
                    {
                        $set: {
                            'tickets.$.state': TicketContant.CANCELED,
                        },
                    },
                );

                const flagIncrease = result ? true : false;
                eventbus.emit(EventContant.CANCEL_BOOKING, { idUser, idTicket, flagIncrease });
                return;
            }

            throw new APIError({
                message: 'Cancel booking missing',
                status: statusCode.SERVER_AUTH_ERROR,
                errorCode: statusCode.SERVER_AUTH_ERROR,
            });
        } catch (err) {
            throw err;
        }
    };

    public static allBookingByUser = async (data: IBookingIdUser): Promise<IResponseBookingUser[]> => {
        try {
            const { idUser } = data;
            if (idUser) {
                let listTicket: any[];

                const flight = await UserBookingModel.findOne({ idUser }).populate({
                    path: 'tickets',
                    populate: {
                        path: 'idTicket',
                    },
                });

                // Get in db
                if (flight && flight?.transform().tickets?.length > 0) {
                    const listFlights = flight.transform().tickets;
                    listTicket = await Promise.all(
                        listFlights.map((item: any) => {
                            let ticket = Object.assign({}, item.idTicket);
                            if (ticket) {
                                return {
                                    ...ticket['_doc'],
                                    idTicket: ticket['_doc']['_id'].toHexString(),
                                    idTicketUserBooking: item._id.toHexString(),
                                    state: item.state,
                                    payment: false,
                                    cancel: item.state === TicketContant.PAYMENTED,
                                };
                            }
                        }),
                    );
                }

                // Get in redis
                const listSoft = await BookingService.getJobByIdUser(data as IBookingIdUser);
                if (listSoft.length <= 0) {
                    return listTicket;
                }
                const listSoftId = await Promise.all(listSoft.map((item) => item.idTicket));
                const tickets = (await TicketModel.find({
                    _id: {
                        $in: listSoftId,
                    }
                }))
                const listSoftBooking: IResponseBookingUser[] = await Promise.all(
                    tickets.map(async (item) => {
                        return {
                            ...item.transform(),
                            idTicket: item._id.toString(),
                            state: TicketContant.NOT_CONFIRM,
                            payment: true,
                            cancel: true,
                        };
                    }),
                );
                return [...listSoftBooking, ...(listTicket?.length > 0 ? listTicket : [])];
            }

            throw new APIError({
                message: 'Something went wrong',
                status: statusCode.SERVER_AUTH_ERROR,
                errorCode: statusCode.SERVER_AUTH_ERROR,
            });
        } catch (err) {
            throw err;
        }
    };

    public static getJobByIdUser = async (job: IBookingIdUser): Promise<IBooking[]> => {
        const queuedJobs = await (
            await QueueService.getQueue(JobContant.JOB_BOOKING)
        ).getJobs(['delayed', 'paused', 'waiting', 'active']);
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
