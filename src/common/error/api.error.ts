import { errors } from 'express-validation';
import httpStatus from 'http-status';
import { statusCode } from '@config/errors';

interface APIErrorParams {
    message: string;
    errors?: errors;
    stack?: string;
    errorCode: number;
    status?: number;
    isPublic?: boolean;
    messageData?: object;
}

export class APIError extends Error {
    public status: number;
    public errorCode: number;
    public isPublic: boolean;
    public errors?: errors;
    public messageData?: object;

    constructor({
        message,
        errors: errs,
        stack,
        errorCode,
        status = httpStatus.INTERNAL_SERVER_ERROR,
        isPublic = false,
        messageData = null,
    }: APIErrorParams) {
        super(message);
        this.stack = stack;
        this.status = status;
        this.isPublic = isPublic;
        this.errors = errs;
        if (errorCode === 0) {
            this.errorCode = status >= 500 ? statusCode.SERVER_ERROR : statusCode.VERIFY_FAILED;
        } else {
            this.errorCode = errorCode;
        }
        this.messageData = messageData;
    }
}
