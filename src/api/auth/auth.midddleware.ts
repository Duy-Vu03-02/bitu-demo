import { NextFunction, Request, Response } from 'express';
import { statusCode } from '@config/errors';
import { Token } from '@config/token';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN, REFETCH_TOKEN } from '@config/enviroment';
import { UserContant } from '@common/contstant/user.contant';

export class AuthMiddleware {
    public static requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const authorization = req.headers.authorization;
        
        if (!authorization) {
            throw new Error('Authorization is missing');
        }
        const token = authorization.split(' ')[1];
        if (!token && !req.cookies[UserContant.ACCESSTOKEN]) {
            throw new Error('Token is missing');
        } else {
            try {
                const verify = await Token.verifyToken(token, ACCESS_TOKEN);
                if (verify) return next();
            } catch (err) {
                if (err.message === 'TokenExpiredError') {
                    const refetchTokenOld = req.headers.authorization.split(' ')[2];
                    if (!refetchTokenOld) return next(err);
                    const verifyRefetch = await Token.verifyToken(refetchTokenOld, REFETCH_TOKEN);
                    if (verifyRefetch) {
                        const payload = await jwt.decode(refetchTokenOld);
                        const { accessToken, refetchToken } = await Token.genderToken(payload);
                        res.cookie(UserContant.ACCESSTOKEN, accessToken, {
                            maxAge: 1000 * 60 * 60,
                        });
                        res.cookie(UserContant.REFTECHTOKEN, refetchToken, {
                            maxAge: 1000 * 60 * 60 * 24 * 30,
                        });
                        return next();
                    }
                } else {
                    next(err);
                }
            }
        }
    };
}
