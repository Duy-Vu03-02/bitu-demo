import { ADD_ID_BOOKING, CREATE_BOOKING, DEL_BOOKING } from '@common/contstant/event.booking';
import {
    IBooking,
    IBookingIdUser,
    ICancelBooking,
    IConfirmBooking,
    IConfirmSendMail,
    IResponseBookingUser,
} from './booking.interface';
import eventbus from '@common/eventbus';
import { UserModel } from '@common/user/user.model';
import { CHUA_XAC_NHAN, DA_HUY, DA_THANH_TOAN } from '@common/contstant/state.ticket';
import { AUTOMATIC_INCREASE, AUTOMATIC_REDUCTION } from '@common/contstant/event.ticket';
import { TicketModel } from '@common/ticket/ticket.model';
import { BookingJob } from '@worker/booking/booking.job';
import { UserBookingModel } from '@common/userBooking/userBooking.model';
import { IUserBooking } from '@common/userBooking/userBooking.interface';

export class BookingService {
    public static bookingTicket = async (data: IBooking): Promise<void> => {
        try {
            const { idUser, idTicket } = data;
            if (idUser && idTicket) {
                eventbus.emit(CREATE_BOOKING, { idUser, idTicket });
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
                            state: DA_THANH_TOAN,
                        },
                    ],
                });

                eventbus.emit(ADD_ID_BOOKING, {
                    idUserBooking: newUserBooking._id,
                    idUser: idUser,
                    idTicket,
                });
                eventbus.emit(DEL_BOOKING, { idUser, idTicket });
                eventbus.emit(AUTOMATIC_REDUCTION, { idUser, idTicket });
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
                            'flight.$.state': DA_HUY,
                        },
                    },
                );
                eventbus.emit(AUTOMATIC_INCREASE, { idUser, idTicket });
            }
            eventbus.emit(DEL_BOOKING, { idUser, idTicket });
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
                                        cancel: item.state === DA_THANH_TOAN,
                                    };
                                }
                            }),
                        );
                    }
                }

                // Get trong redis
                const listSoft = await BookingJob.getJobByIdUser(data as IBookingIdUser);
                if (listSoft.length <= 0) {
                    return listTicket;
                }
                const listSoftId = await Promise.all(listSoft.map((item) => item.idTicket));
                const listSoftBooking: IResponseBookingUser[] = await Promise.all(
                    listSoftId.map(async (item) => {
                        return {
                            ...(await TicketModel.findById(item)).toJSON(),
                            state: CHUA_XAC_NHAN,
                            payment: true,
                            cancel: true,
                        };
                    }),
                );
                return [...listSoftBooking,...listTicket];
            }
        } catch (err) {
            console.error(err);
        }
    };
}
