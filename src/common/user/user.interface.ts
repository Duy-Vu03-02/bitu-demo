import mongoose, { Schema } from 'mongoose';

export interface IUserDataToken extends IUserResponse {
    id: string;
}
export interface IUserLogin {
    phone: string;
    password: string;
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
            idTickket: string;
            idSoftLight: string;
            state: String;
            confirm: Boolean;
        },
    ];
}
export interface IUserData extends Document {
    _id: Schema.Types.ObjectId;
    phone: string;
    password: string;
    username: string;
    flight: [
        {
            idTickket: Schema.Types.ObjectId;
            idSoftLight: Schema.Types.ObjectId;
            state: string;
            confirm: Boolean;
        },
    ];
}
