import { transform } from 'typescript';
import mongoose, { Schema } from 'mongoose';

export interface IGetTicket {
    idUser: string;
}

export interface IGetTicketByTime {
    time: Date;
}

export interface IAutoReduction {
    idTicket: string;
}

export interface IAutoIncrease {
    idTicket: string;
    flagIncrease: boolean;
}

export interface ITicketResponse {
    id: string;
    timeStart: Date;
    from: {
        idLocation: string;
        name: string;
    };
    to: {
        idLocation: string;
        name: string;
    };
    quantity: number;
    price: number;
}

export interface ITicket extends Document {
    _id: Schema.Types.ObjectId;
    timeStart: Date;
    from: {
        idLocation: Schema.Types.ObjectId;
        name: String;
    };
    to: {
        idLocation: Schema.Types.ObjectId;
        name: String;
    };
    quantity: Number;
    price: Number;

    transform(): ITicketResponse;
}
