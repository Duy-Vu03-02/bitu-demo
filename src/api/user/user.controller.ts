import { UserContant } from './../../common/contstant/user.contant';
import { UserModel } from '@common/user/user.model';
import { IUserRegister, IUserLogin, IUserForgorPassword, IUserOTP } from '@common/user/user.interface';
import { UserService } from '@common/user/user.service';
import { Response, Request, NextFunction } from 'express';
import { Token } from '@config/token';
import { IUserDataToken } from '@common/user/user.interface';
import { statusCode } from '@config/errors';
import { ACCESSTOKEN_SECRET, REFETCHTOKEN_SECRET } from '@config/enviroment';
import { APIError } from '@common/error/api.error';
import httpStatus from 'http-status';

export class UserController {
    public static login = async (req: Request, res: Response, next: NextFunction): Promise<unknown> => {
        try {
            const user = await UserService.login(req.body as IUserLogin);
            if (user) {
                const { accessToken, refetchToken } = await Token.genderToken(user as IUserDataToken);
                return res.sendJson({
                    data: user,
                    [UserContant.ACCESSTOKEN]: accessToken,
                    [UserContant.REFTECHTOKEN]: refetchToken,
                });
            }
            next(
                new APIError({
                    message: 'Login Faild',
                    status: httpStatus.UNAUTHORIZED,
                    errorCode: statusCode.AUTH_ACCOUNT_NOT_FOUND,
                }),
            );
        } catch (err) {
            next(err);
        }
    };

    public static register = async (req: Request, res: Response, next: NextFunction): Promise<unknown> => {
        try {
            const newUser = await UserService.register(req.body as IUserRegister);
            if (newUser) {
                const { accessToken, refetchToken } = await Token.genderToken(newUser as IUserDataToken);

                return res.sendJson({
                    data: newUser,
                    [UserContant.ACCESSTOKEN]: accessToken,
                    [UserContant.REFTECHTOKEN]: refetchToken,
                });
            }

            next(
                new APIError({
                    message: 'Register Faild',
                    status: statusCode.REQUEST_NOT_FOUND,
                    errorCode: statusCode.AUTH_ACCOUNT_NOT_FOUND,
                }),
            );
        } catch (err) {
            next(err);
        }
    };

    public static loginByToken = async (req: Request, res: Response, next: NextFunction): Promise<unknown> => {
        try {
            const authorization = req.headers.authorization;
            if (authorization) {
                const token = JSON.parse(authorization.split(' ')[1]);
                if (token) {
                    try {
                        const accesstoken = token[UserContant.ACCESSTOKEN];
                        const verify = await Token.verifyToken(accesstoken, ACCESSTOKEN_SECRET);
                        if (verify) {
                            const payload = JSON.parse(atob(accesstoken.split('.')[1]));
                            const { id } = payload;
                            if (id) {
                                const user = await UserModel.findById(id);
                                if (user) {
                                    return res.sendJson({
                                        data: user.transform(),
                                    });
                                }
                            }
                        }
                    } catch (err) {
                        if (err.message === 'TokenExpiredError') {
                            if (token[UserContant.REFTECHTOKEN]) {
                                const verifyRefetch = await Token.verifyToken(
                                    token[UserContant.REFTECHTOKEN],
                                    REFETCHTOKEN_SECRET,
                                );
                                if (verifyRefetch) {
                                    const payload = JSON.parse(atob(token[UserContant.REFTECHTOKEN].split('.')[1]));
                                    const { accessToken, refetchToken } = await Token.genderToken(payload);
                                    const { id } = payload;
                                    if (id) {
                                        const user = await UserModel.findById(id);
                                        if (user) {
                                            return res.sendJson({
                                                data: user,
                                                [UserContant.ACCESSTOKEN]: accessToken,
                                                [UserContant.REFTECHTOKEN]: refetchToken,
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            next(
                new APIError({
                    message: 'Authorization is missing',
                    status: statusCode.AUTH_ACCOUNT_NOT_FOUND,
                    errorCode: statusCode.AUTH_ACCOUNT_NOT_FOUND,
                }),
            );
        } catch (err) {
            next(err);
        }
    };
    public static logout = async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.cookie(
                UserContant.ACCESSTOKEN,
                {},
                {
                    maxAge: 0,
                },
            );
            res.cookie(
                UserContant.REFTECHTOKEN,
                {},
                {
                    maxAge: 0,
                },
            );
            res.sendJson({
                data: null,
            });
        } catch (err) {
            next(err);
        }
    };

    public static forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<unknown> => {
        try {
            const checkUser = await UserService.forgotPassword({
                ...req.body,
                ip: req.socket.remoteAddress,
            } as IUserForgorPassword);
            if (checkUser) {
                return res.sendJson({
                    data: null,
                });
            }

            next(
                new APIError({
                    message: 'Forgot password is missing',
                    status: statusCode.AUTH_ACCOUNT_NOT_FOUND,
                    errorCode: statusCode.AUTH_ACCOUNT_NOT_FOUND,
                }),
            );
        } catch (err) {
            next(err);
        }
    };

    public static verifyOTP = async (req: Request, res: Response, next: NextFunction): Promise<unknown> => {
        try {
            const userOTP = await UserService.verifyOTP({
                ip: req.socket.remoteAddress,
                ...req.body,
            } as IUserOTP);

            if (userOTP) {
                const { accessToken, refetchToken } = await Token.genderToken(userOTP as IUserDataToken);

                return res.sendJson({
                    data: userOTP,
                    [UserContant.ACCESSTOKEN]: accessToken,
                    [UserContant.REFTECHTOKEN]: refetchToken,
                });
            }
            next(
                new APIError({
                    message: 'Verify OTP faild',
                    status: statusCode.REQUEST_NOT_FOUND,
                    errorCode: statusCode.REQUEST_VALIDATION_ERROR,
                }),
            );
        } catch (err) {
            next(err);
        }
    };
}
