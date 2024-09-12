import mongoose, { Schema } from 'mongoose';
import { IUserData, IUserResponse } from './user.interface';
import { transform } from 'typescript';

const UserSchema: Schema<IUserData> = new Schema(
    {
        phone: { type: String, required: true },
        password: { type: String, required: true, select: false },
        username: { type: String },
        email: { type: String },
        flight: { type: Schema.Types.ObjectId, ref: 'UserBooking' },
    },
    {
        timestamps: true,
    },
);

UserSchema.method({
    transform(): IUserResponse {
        const transformed: IUserResponse = {
            id: this._id.toHexString(),
            username: this.username,
            phone: this.phone,
            flight: this.flight,
        };
        return transformed;
    },
});

export const UserModel = mongoose.model<IUserData>('User', UserSchema);
