import { Schema } from 'mongoose';

export interface IUserBooking extends Document {
    _id: string;
    idUser: Schema.Types.ObjectId;
    tickets: [
        {
            idTicket: Schema.Types.ObjectId;
            state: string;
        },
    ];
}
