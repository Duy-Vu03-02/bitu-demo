import { IBooking, IBookingIdUser, ICancelBooking, IConfirmBooking, IResponseBookingUser } from './booking.interface';
import eventbus from '@common/eventbus';
import { UserModel } from '@common/user/user.model';
import { TicketContant } from '@common/contstant/ticket.contant';
import { TicketModel } from '@common/ticket/ticket.model';
import { UserBookingModel } from '@common/userBooking/userBooking.model';
import { IUserBooking } from '@common/userBooking/userBooking.interface';
import { EventContant } from '@common/contstant/event.contant';
import { QueueService } from '@common/queue/queue.service';
import { JobContant } from '@common/contstant/job.contant';
import { APIError } from '@common/error/api.error';
import { statusCode } from '@config/errors';
import { BookingJob } from '@worker/booking/booking.job';
import { BookingEvent } from './booking.event';

export class BookingService {
    private static delayJOb: number = 1000 * 60 * 5;


    public static bookingTicket = async (data: IBooking): Promise<void> => {
        try {
            const { idUser, idTicket } = data;
            if (idUser && idTicket) {
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

            throw new APIError({
                message: 'Booking missing',
                status: statusCode.SERVER_AUTH_ERROR,
                errorCode: statusCode.SERVER_AUTH_ERROR,
            });
        } catch (err) {
            throw new Error(err);
        }
    };

    public static confirmBooking = async (data: IConfirmBooking): Promise<void> => {
        try {
            const { idUser, idTicket } = data;
            if (idUser && idTicket) {
                const flight = await UserBookingModel.updateOne({
                    idUser,
                    "tickets.idTicket": idTicket,
                }, {
                    tickets: {
                        $push: {
                            idTicket,
                            state: TicketContant.PAYMENTED,
                        }
                    }
                })

                eventbus.emit(EventContant.CONFIRM_BOOKING, {
                    idUser: idUser,
                    idTicket,
                });
                return;
            }

            throw new APIError({
                message: 'Confirm booking missing',
                status: statusCode.SERVER_AUTH_ERROR,
                errorCode: statusCode.SERVER_AUTH_ERROR,
            });
        } catch (err) {
            throw new Error(err);
        }
    };

    public static cancelBooking = async (data: ICancelBooking): Promise<void> => {
        try {
            const { idUser, idTicket } = data;
            if (idUser && idTicket) {
                const flight = await UserBookingModel.updateOne({
                    idUser,
                    "tickets.idTicket": idTicket,
                }, {
                    $set: {
                        "tickets.$.state": TicketContant.CANCELED
                    }
                })
                console.log(flight);

                eventbus.emit(EventContant.CANCEL_BOOKING, { idUser, idTicket });
                return;
            }

            throw new APIError({
                message: 'Cancel booking missing',
                status: statusCode.SERVER_AUTH_ERROR,
                errorCode: statusCode.SERVER_AUTH_ERROR,
            });
        } catch (err) {
            throw new Error(err);
        }
    };

    public static allBookingByUser = async (data: IBookingIdUser): Promise<IResponseBookingUser[]> => {
        try {
            const { idUser } = data;
            if (idUser) {
                let listTicket: any[];
                
                    const flight = (await UserBookingModel.findOne({idUser})
                        .populate({
                            path: 'tickets',
                            populate: {
                                path: 'idTicket',
                            },
                        }));
                        ;
                    if (flight && flight?.transform().tickets?.length > 0) {
                        const listFlights = flight.transform().tickets;
                        console.log(flight.transform())
                        listTicket = await Promise.all(
                            listFlights.map((item) => {
                                let ticket = Object.assign({}, item.idTicket);
                                if (ticket) {
                                    console.log(item)
                                    return {
                                        ...ticket['_doc'],
                                        // id: ticket['_doc']['_id'].toHexString(),
                                        state: item.state,
                                        payment: false,
                                        cancel: item.state === TicketContant.PAYMENTED,
                                    };
                                }
                            }),
                        );
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
                            ...(await TicketModel.findById(item)).transform(),
                            state: TicketContant.NOT_CONFIRM,
                            payment: true,
                            cancel: true,
                        };
                    }),
                );
                return [ ...listSoftBooking,...(listTicket?.length > 0 ? listTicket : [])];
            }

            throw new APIError({
                message: 'Something went wrong',
                status: statusCode.SERVER_AUTH_ERROR,
                errorCode: statusCode.SERVER_AUTH_ERROR,
            });
        } catch (err) {
            throw new Error(err);
        }
    };

    // public static allBookingByUser = async (data: IBookingIdUser): Promise<IResponseBookingUser[]> => {
    //     try {
    //         const { idUser } = data;
    //         if (idUser) {
    //             const user = await UserModel.findById(idUser);
    //             let listTicket: any[];
    //             if (user && user?.flight) {
    //                 const flight = await UserBookingModel.findOne({ idUser: user._id })
    //                     .populate({
    //                         path: 'tickets',
    //                         populate: {
    //                             path: 'idTicket',
    //                         },
    //                     })
    //                     .lean();

    //                 if (flight && flight?.tickets?.length > 0) {
    //                     const listFlights = flight.tickets;
    //                     listTicket = await Promise.all(
    //                         listFlights.map((item) => {
    //                             let ticket = Object.assign({}, item.idTicket);
    //                             if (ticket) {
    //                                 return {
    //                                     ...ticket['_doc'],
    //                                     id: ticket['_doc']['_id'].toHexString(),
    //                                     state: item.state,
    //                                     payment: false,
    //                                     cancel: item.state === TicketContant.PAYMENTED,
    //                                 };
    //                             }
    //                         }),
    //                     );
    //                 }
    //             }

    //             // Get trong redis
    //             const listSoft = await BookingService.getJobByIdUser(data as IBookingIdUser);
    //             if (listSoft.length <= 0) {
    //                 return listTicket;
    //             }
    //             const listSoftId = await Promise.all(listSoft.map((item) => item.idTicket));
    //             const listSoftBooking: IResponseBookingUser[] = await Promise.all(
    //                 listSoftId.map(async (item) => {
    //                     return {
    //                         ...(await TicketModel.findById(item)).transform(),
    //                         state: TicketContant.NOT_CONFIRM,
    //                         payment: true,
    //                         cancel: true,
    //                     };
    //                 }),
    //             );
    //             return [...listSoftBooking, ...(listTicket?.length > 0 ? listTicket : [])];
    //         }

    //         throw new APIError({
    //             message: 'Something went wrong',
    //             status: statusCode.SERVER_AUTH_ERROR,
    //             errorCode: statusCode.SERVER_AUTH_ERROR,
    //         });
    //     } catch (err) {
    //         throw new Error(err);
    //     }
    // };

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
