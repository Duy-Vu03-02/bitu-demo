import mongoose, { Schema } from 'mongoose';
import { IUserData } from './user.interface';

const UserSchema: Schema<IUserData> = new Schema(
    {
        phone: { type: String, required: true },
        password: { type: String, required: true, select: false },
        username: { type: String },
        flight: [
            {
                idTickket: { type: Schema.Types.ObjectId, ref: 'Ticket' },
                state: { type: String },
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
