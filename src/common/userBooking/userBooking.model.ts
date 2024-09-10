import mongoose, { Schema } from 'mongoose';
import { IUserBooking } from './userBooking.interface';
import { CHUA_XAC_NHAN, DA_HUY, DA_THANH_TOAN } from '@common/contstant/ticket.state';

const UserBookingSchema: Schema<IUserBooking> = new Schema(
    {
        idUser: { type: Schema.Types.ObjectId, ref: 'User' },
        tickets: [
            {
                idTicket: { type: Schema.Types.ObjectId, ref: 'Ticket' },
                state: { type: String, enum: [DA_HUY, DA_THANH_TOAN, CHUA_XAC_NHAN] },
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
