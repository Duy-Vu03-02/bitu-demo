import { Schema } from 'mongoose';

export interface IUserBooking extends Document {
    _id: Schema.Types.ObjectId;
    idUser: Schema.Types.ObjectId;
    tickets: [
        {
            idTicket: Schema.Types.ObjectId;
            state: string;
        },
    ];

    transform() : IUserBookingReponse;
}

export interface IUserBookingReponse    {
    id: string;
    idUser: string;
    tickets: [
        {
            idTicket: string;
            state: string;
            id: string;
        },
    ];
}