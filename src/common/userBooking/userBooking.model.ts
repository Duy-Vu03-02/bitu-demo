import mongoose, { Schema } from 'mongoose';
import { IUserBooking } from './userBooking.interface';
import { TicketContant } from '@common/contstant/ticket.contant';

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
        toJSON: {
            transform: (doc, ret) => {
                ret.id = ret._id.toHexString();
                delete ret._id;
                delete ret._v;
            },
        },
    },
);

export const UserBookingModel = mongoose.model<IUserBooking>('UserBookingModel', UserBookingSchema);
