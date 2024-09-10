import { UserModel } from '@common/user/user.model';
import { IUserRegister, IUserLogin, IUserForgorPassword, IUserOTP } from '@common/user/user.interface';
import { UserService } from '@common/user/user.service';
import { Response, Request } from 'express';
import { Token } from '@config/token';
import { IUserDataToken } from '@common/user/user.interface';
import { statusCode } from '@config/errors';
import { ACCESSTOKEN, REFTECHTOKEN } from '@common/contstant/user.token';
import { ACCESS_TOKEN, REFETCH_TOKEN } from '@config/enviroment';

export class UserController {
    public static login = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await UserService.login(req.body as IUserLogin);
            if (user) {
                const { accessToken, refetchToken } = await Token.genderToken(user as IUserDataToken);
                res.cookie(ACCESSTOKEN, accessToken, {
                    maxAge: 1000 * 60 * 60,
                });
                res.cookie(REFTECHTOKEN, refetchToken, {
                    maxAge: 1000 * 60 * 60 * 24 * 30,
                });
                res.sendJson({ 
                    data: user });
            }
        } catch (err) {
            res.sendJson({
                message: err.message,
                status: statusCode.SERVER_ERROR
            })
        }
    };

    public static register = async (req: Request, res: Response): Promise<void> => {
        try {
            const newUser = await UserService.register(req.body as IUserRegister);
            if (newUser) {
                const { accessToken, refetchToken } = await Token.genderToken(newUser.toJSON() as IUserDataToken);
                res.cookie(ACCESSTOKEN, accessToken, {
                    maxAge: 1000 * 60 * 60,
                });
                res.cookie(REFTECHTOKEN, refetchToken, {
                    maxAge: 1000 * 60 * 60 * 24 * 30,
                });
                res.sendJson({
                    data: newUser,
                });
            }
        } catch (err) {
            res.sendJson({
                message: err.message,
                status: statusCode.SERVER_ERROR
            })
        }
    };

    public static loginByToken = async (req: Request, res: Response): Promise<void> => {
        try {
            const authorization = req.headers.authorization;

            if (!authorization) {
                res.sendJson({
                    error_code: statusCode.AUTH_ACCOUNT_NOT_FOUND,
                    messgae: 'Authorization is missing',
                });
            }
            const token = authorization.split(' ')[1];
            if (!token && !req.cookies[REFTECHTOKEN]) {
                res.sendJson({
                    error_code: statusCode.AUTH_ACCOUNT_NOT_FOUND,
                    messgae: 'Authorization is missing',
                });
            } else {
                try {
                    const verify = await Token.verifyToken(token, ACCESS_TOKEN);
                    if (verify) {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        const { id } = payload;
                        if (id) {
                            const user = await UserModel.findById(id);
                            if (user) {
                                res.sendJson({
                                    data: user,
                                });
                            }
                        }
                    } else {
                        res.sendJson({
                            error_code: statusCode.AUTH_ACCOUNT_NOT_FOUND,
                            message: 'Token not found',
                        });
                    }
                } catch (err) {
                    if (err.message === 'TokenExpiredError') {
                        const refetchTokenOld = req.headers.authorization.split(' ')[2];
                        if (!refetchTokenOld) {
                            res.status(statusCode.AUTH_ACCOUNT_NOT_FOUND).json({ messgae: 'Token not found' }).end();
                        }
                        const verifyRefetch = await Token.verifyToken(refetchTokenOld, REFETCH_TOKEN);
                        if (verifyRefetch) {
                            const payload = JSON.parse(atob(refetchTokenOld.split('.')[1]));
                            const { accessToken, refetchToken } = await Token.genderToken(payload);
                            res.cookie(ACCESSTOKEN, accessToken, {
                                maxAge: 1000 * 60 * 60,
                            });
                            res.cookie(REFTECHTOKEN, refetchToken, {
                                maxAge: 1000 * 60 * 60 * 24 * 30,
                            });
                            const { id } = payload;
                            if (id) {
                                const user = await UserModel.findById(id);
                                if (user) {
                                    res.sendJson({
                                        data: user,
                                    });
                                }
                            }
                        } else {
                            res.sendJson({
                                error_code: statusCode.AUTH_ACCOUNT_NOT_FOUND,
                                messgae: 'Authorization is missing',
                            });
                        }
                    } else {
                        res.sendJson({
                            error_code: statusCode.AUTH_ACCOUNT_NOT_FOUND,
                            messgae: 'Authorization is missing',
                        });
                    }
                }
            }
        } catch (err) {
            console.error(err);
        }
    };
    public static logout = async (req: Request, res: Response) => {
        try {
            res.cookie(
                ACCESSTOKEN,
                {},
                {
                    maxAge: 0,
                },
            );
            res.cookie(
                REFTECHTOKEN,
                {},
                {
                    maxAge: 0,
                },
            );
            res.json(200);
        } catch (err) {
            console.error(err);
        }
    };

    public static forgotPassword = async (req: Request, res: Response): Promise<void> => {
        try {
            const checkUser = await UserService.forgotPassword({
                ...req.body,
                ip: req.socket.remoteAddress,
            } as IUserForgorPassword);
            if (checkUser) {
                res.status(statusCode.OK).json({ messgae: 'Xac nhan thanh cong vui long check EMAIL' });
            } else {
                res.status(statusCode.AUTH_ACCOUNT_NOT_FOUND);
            }
        } catch (err) {
            console.error(err);
        }
    };

    public static verifyOTP = async (req: Request, res: Response): Promise<void> => {
        try {
            const userOTP = await UserService.verifyOTP({
                ip: req.socket.remoteAddress,
                ...req.body,
            } as IUserOTP);

            if (userOTP) {
                const { accessToken, refetchToken } = await Token.genderToken(userOTP as IUserDataToken);
                res.cookie(ACCESSTOKEN, accessToken, {
                    maxAge: 1000 * 60 * 60,
                });
                res.cookie(REFTECHTOKEN, refetchToken, {
                    maxAge: 1000 * 60 * 60 * 24 * 30,
                });
                res.status(statusCode.OK).json(userOTP);
            } else {
                res.sendStatus(statusCode.AUTH_ACCOUNT_NOT_FOUND);
            }
        } catch (err) {
            console.error(err);
        }
    };
}
