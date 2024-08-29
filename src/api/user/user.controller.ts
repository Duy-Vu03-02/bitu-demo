import { jwt } from 'jsonwebtoken';
import { UserModel } from '@common/user/user.model';
import { IUserRegister, IUserLogin } from '@common/user/user.interface';
import { UserService } from '@common/user/user.service';
import { Response, Request } from 'express';
import { Token } from '@config/token';
import { IUserDataToken } from '@common/user/user.interface';
import { statusCode } from '@config/errors';

export class UserController {
    public static login = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await UserService.login(req.body as IUserLogin);
            console.log(user)
            // if (user) {
            //     const { accessToken, refetchToken } = await Token.genderToken(user as IUserDataToken);
            //     res.cookie('accessToken', accessToken, {
            //         maxAge: 1000 * 30,
            //     });
            //     res.cookie('refetchToken', refetchToken, {
            //         maxAge: 1000 * 60 * 60 * 24 * 30,
            //     });
            //     res.status(statusCode.OK).json(user);
            // }
        } catch (err) {
            console.error(err);
        }
    };

    public static register = async (req: Request, res: Response): Promise<void> => {
        try {
            const newUser = await UserService.register(req.body as IUserRegister);
            if (newUser) {
                res.status(statusCode.OK).json(newUser);
            }
        } catch (err) {
            console.log(err);
        }
    };

    public static loginByToken = async (req: Request, res: Response): Promise<void> => {
        const token = req.cookies.accessToken;
        if (!token) {
            res.status(statusCode.AUTH_ACCOUNT_NOT_FOUND);
        } else {
            try {
                const verify = await Token.verifyToken(token);
                if (verify) {
                    const payload = jwt.decode(token);
                    const { id } = payload;
                    if (id) {
                        const user = await UserModel.findById(id);
                        if (user) {
                            res.status(statusCode.OK).json(user);
                        }
                    }
                }
                res.status(statusCode.AUTH_ACCOUNT_NOT_FOUND).json({ messgae: 'Token not found' });
            } catch (err) {
                if (err.message === 'TokenExpiredError') {
                    const refetchTokenOld = req.cookies.refetchToken;
                    if (!refetchTokenOld) {
                        res.status(statusCode.AUTH_ACCOUNT_NOT_FOUND).json({ messgae: 'Token not found' });
                    }
                    const verifyRefetch = await Token.verifyToken(refetchTokenOld);
                    if (verifyRefetch) {
                        const payload = await jwt.decode(refetchTokenOld);
                        const { accessToken, refetchToken } = await Token.genderToken(payload);
                        res.cookie('accessToken', accessToken, {
                            maxAge: 1000 * 30,
                        });
                        res.cookie('refetchToken', refetchToken, {
                            maxAge: 1000 * 60 * 60 * 24 * 30,
                        });
                        const { id } = payload;
                        if (id) {
                            const user = await UserModel.findById(id);
                            if (user) {
                                res.status(statusCode.OK).json(user);
                            }
                        }
                    }
                } else {
                    res.status(statusCode.AUTH_ACCOUNT_NOT_FOUND).json({ messgae: 'Token not found' });
                }
            }
        }
    };
}
