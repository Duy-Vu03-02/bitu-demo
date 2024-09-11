import { NextFunction, Request, Response } from 'express';
import { statusCode } from '@config/errors';
import { Token } from '@config/token';
import jwt from 'jsonwebtoken';
import { ACCESSTOKEN_SECRET, REFETCHTOKEN_SECRET } from '@config/enviroment';
import { UserContant } from '@common/contstant/user.contant';
import { APIError } from '@common/error/api.error';

export class AuthMiddleware {
    public static requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const authorization = req.headers.authorization;
        if (authorization) {
            const token = JSON.parse(authorization.split(' ')[1]);
            if (token) {
                try {
                    const accesstoken  = token[UserContant.ACCESSTOKEN];
                    const verify = await Token.verifyToken(accesstoken, ACCESSTOKEN_SECRET);
                    if (verify) return next();
                } catch (err) {
                    if (err.message === 'TokenExpiredError') {
                        if(token[UserContant.REFTECHTOKEN]){
                            const verifyRefetch = await Token.verifyToken(token[UserContant.REFTECHTOKEN], REFETCHTOKEN_SECRET);
                        if (verifyRefetch) {
                            const payload = JSON.parse(atob(token[UserContant.REFTECHTOKEN].split('.')[1]));
                            const { accessToken, refetchToken } = await Token.genderToken(payload);
                            req[UserContant.ACCESSTOKEN] = accessToken;
                            req[UserContant.REFTECHTOKEN] = refetchToken;
                            return next();
                        }
                        }
                    } else {
                        return next(err);
                    }
                }
            }
        }

        return next(
            new APIError({
                message: 'Authorization is missing',
                status: statusCode.AUTH_ACCOUNT_NOT_FOUND,
                errorCode: statusCode.AUTH_ACCOUNT_NOT_FOUND,
            }),
        );
    };
}
