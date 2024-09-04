import { CREATE_BOOKING, DEL_BOOKING } from '@common/contstant/event.booking';
import {
    IAllBookingUser,
    IBooking,
    IBookingIdUser,
    ICancelBooking,
    IConfirmBooking,
    IResponseBookingUser,
} from './booking.interface';
import eventbus from '@common/eventbus';
import { UserModel } from '@common/user/user.model';
import { CHUA_XAC_NHAN, DA_HUY, DA_THANH_TOAN } from '@common/contstant/state.ticket';
import { AUTOMATIC_INCREASE, AUTOMATIC_REDUCTION } from '@common/contstant/event.ticket';
import { QueueService } from '@common/queue/queue.service';
import { TicketModel } from '@common/ticket/ticket.model';

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
                await UserModel.findByIdAndUpdate(idUser, {
                    $push: {
                        flight: {
                            idTicket,
                            state: DA_THANH_TOAN,
                        },
                    },
                });
            }

            eventbus.emit(DEL_BOOKING, { idUser, idTicket });
            eventbus.emit(AUTOMATIC_REDUCTION, { idUser, idTicket });
        } catch (err) {
            console.error(err);
        }
    };

    public static cancelBooking = async (data: ICancelBooking): Promise<void> => {
        try {
            const { idUser, idTicket } = data;
            if (idUser && idTicket) {
                await UserModel.findOne(
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
                eventbus.emit(DEL_BOOKING, { idUser, idTicket });
                eventbus.emit(AUTOMATIC_INCREASE, { idUser, idTicket });
            }
        } catch (err) {
            console.error(err);
        }
    };

    public static allBookingByUser = async (data: IBookingIdUser): Promise<IResponseBookingUser[]> => {
        try {
            const { idUser } = data;
            if (idUser) {
                const user = await UserModel.findById(idUser).populate({
                    path: 'flight',
                    populate: {
                        path: 'idTicket',
                    },
                });
                const listTicket = await Promise.all(
                    user.flight.map((item) => {
                        return {
                            state: item.state,
                            ...item.idTicket,
                            payment: false,
                            cancel: item.state === DA_THANH_TOAN ? true : false,
                        };
                    }),
                );
                console.log(listTicket);
                const listSoft = await QueueService.getJobByIdUser(data as IBookingIdUser);
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
                return listSoftBooking;
            }
        } catch (err) {
            console.error(err);
        }
    };
}
