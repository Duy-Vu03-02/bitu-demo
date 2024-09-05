import { ACCESSTOKEN, REFTECHTOKEN } from '@common/contstant/token.user';
import mongoose, { Schema } from 'mongoose';

export interface IUserDataToken extends IUserResponse {
    id: string;
}
export interface IUserLogin {
    phone: string;
    password: string;
}

export interface ITokenAuthen {
    [ACCESSTOKEN]: string;
    [REFTECHTOKEN]: string;
}

export interface IUserRegister {
    phone: string;
    password: string;
    username: string;
}

export interface IUserResponse {
    id: string;
    phone: string;
    username: string;
    flight: [
        {
            idTicket: string;
            idSoftLight: string;
            state: String;
            confirm: Boolean;
        },
    ];
}
export interface IUserData extends Document {
    _id: Schema.Types.ObjectId;
    phone: string;
    email: string;
    password: string;
    username: string;
    flight: [
        {
            idTicket: Schema.Types.ObjectId;
            idSoftLight: Schema.Types.ObjectId;
            state: string;
            confirm: Boolean;
        },
    ];
}
