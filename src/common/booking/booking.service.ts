import { CREATE_BOOKING } from '@common/contstant/event.booking';
import { IBooking, ICancelBooking, IConfirmBooking } from './booking.interface';
import eventbus from '@common/eventbus';
import { UserModel } from '@common/user/user.model';
import { DA_HUY, DA_THANH_TOAN } from '@common/contstant/state.ticket';
import { AUTOMATIC_INCREASE, AUTOMATIC_REDUCTION } from '@common/contstant/event.ticket';

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

                eventbus.emit(AUTOMATIC_INCREASE, { idUser, idTicket });
            }
        } catch (err) {
            console.error(err);
        }
    };
}
