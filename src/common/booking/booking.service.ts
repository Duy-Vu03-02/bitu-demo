import { Queue } from 'bull';
import { CREATE_BOOKING, DEL_BOOKING } from '@common/contstant/event.booking';
import {
    IBooking,
    IBookingIdUser,
    IBookingSendMai,
    ICancelBooking,
    IConfirmBooking,
    IResponseBookingUser,
} from './booking.interface';
import eventbus from '@common/eventbus';
import { UserModel } from '@common/user/user.model';
import { CHUA_XAC_NHAN, DA_HUY, DA_THANH_TOAN } from '@common/contstant/state.ticket';
import { AUTOMATIC_INCREASE, AUTOMATIC_REDUCTION } from '@common/contstant/event.ticket';
import { TicketModel } from '@common/ticket/ticket.model';
import { BookingJob } from '@worker/booking/booking.job';
import { BookingSendMail } from './booking.email-job';
import { SEND_MAIL } from '@common/contstant/event.mailer';

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
                const user = await UserModel.findByIdAndUpdate(idUser, {
                    $push: {
                        flight: {
                            idTicket,
                            state: DA_THANH_TOAN,
                        },
                    },
                });
                if (user.email) {
                    eventbus.emit(SEND_MAIL, { email: user.email });
                }
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
                let user = await UserModel.findById(idUser)
                    .populate({
                        path: 'flight',
                        populate: {
                            path: 'idTicket',
                        },
                    })
                    .lean();

                const listTicket =
                    user.flight.length < 0
                        ? []
                        : await Promise.all(
                              user.flight.map((item) => {
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
                return [...listSoftBooking, ...listTicket];
            }
        } catch (err) {
            console.error(err);
        }
    };
}
