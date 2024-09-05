import mongoose, { Schema } from 'mongoose';
import { IUserData } from './user.interface';
import { CHUA_XAC_NHAN } from '@common/contstant/state.ticket';

const UserSchema: Schema<IUserData> = new Schema(
    {
        phone: { type: String, required: true },
        password: { type: String, required: true, select: false },
        username: { type: String },
        email: { type: String },
        flight: [
            {
                idTicket: { type: Schema.Types.ObjectId, ref: 'Ticket' },
                state: { type: String, default: CHUA_XAC_NHAN },
            },
        ],
    },
    {
        timestamps: true,
        toJSON: {
            transform: (doc, ret) => {
                ret.id = ret._id.toHexString();
                delete ret._id;
                delete ret.__v;
                delete ret.password;
            },
        },
    },
);

export const UserModel = mongoose.model<IUserData>('User', UserSchema);
