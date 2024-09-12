import { UserContant } from '@common/contstant/user.contant';
import mongoose, { Schema } from 'mongoose';

export interface IUserDataToken extends IUserResponse {
    id: string;
}
export interface IUserLogin {
    phone: string;
    password: string;
}

export interface ITokenAuthen {
    [UserContant.ACCESSTOKEN]: string;
    [UserContant.REFTECHTOKEN]: string;
}

export interface IUserRegister {
    phone: string;
    password: string;
    username: string;
    email: string;
}

export interface IUserResponse {
    id: string;
    phone: string;
    username: string;
    flight: string;
}
export interface IUserData extends Document {
    _id: Schema.Types.ObjectId;
    phone: string;
    email: string;
    password: string;
    username: string;
    flight: Schema.Types.ObjectId;

    transform(): IUserResponse;
}

export interface IUserForgorPassword {
    email: string;
    ip: string;
    otp?: string;
}

export interface IUserOTP {
    otp: string;
    email?: string;
    ip: string;
}
