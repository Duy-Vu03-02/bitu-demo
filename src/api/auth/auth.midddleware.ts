import { NextFunction, Request, Response } from 'express';
import { statusCode } from '@config/errors';
import { Token } from '@config/token';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN, REFETCH_TOKEN } from '@config/enviroment';

export class AuthMiddleware {
    public static requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const token = req.cookies.accessToken;
        if (!token) {
            res.status(statusCode.AUTH_ACCOUNT_NOT_FOUND);
        } else {
            try {
                const verify = await Token.verifyToken(token, ACCESS_TOKEN);
                if (verify) return next();
            } catch (err) {
                if (err.message === 'TokenExpiredError') {
                    const refetchTokenOld = req.cookies.refetchToken;
                    if (!refetchTokenOld) return next(err);
                    const verifyRefetch = await Token.verifyToken(refetchTokenOld, REFETCH_TOKEN);
                    if (verifyRefetch) {
                        const payload = await jwt.decode(refetchTokenOld);
                        const { accessToken, refetchToken } = await Token.genderToken(payload);
                        res.cookie('accessToken', accessToken, {
                            maxAge: 1000 * 30,
                        });
                        res.cookie('refetchToken', refetchToken, {
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
