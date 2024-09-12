import mongoose, { Schema } from 'mongoose';
import { IUserBooking, IUserBookingReponse } from './userBooking.interface';
import { TicketContant } from '@common/contstant/ticket.contant';
import { transform } from 'typescript';

const UserBookingSchema: Schema<IUserBooking> = new Schema(
    {
        idUser: { type: Schema.Types.ObjectId, ref: 'User' },
        tickets: [
            {
                idTicket: { type: Schema.Types.ObjectId, ref: 'Ticket' },
                state: {
                    type: String,
                    enum: [TicketContant.PAYMENTED, TicketContant.CANCELED, TicketContant.NOT_CONFIRM],
                },
            },
        ],
    },
    {
        timestamps: true,
    },
);

UserBookingSchema.method({
    transform(): IUserBookingReponse {
        const tranformed: IUserBookingReponse = {
            id: this._id.toHexString(),
            idUser: this.idUser.toHexString(),
            tickets: this.tickets,
        };
        return tranformed;
    },
});

export const UserBookingModel = mongoose.model<IUserBooking>('UserBooking', UserBookingSchema);
