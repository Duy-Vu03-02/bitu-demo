import { IUserDataToken } from '@common/user/user.interface';
import jwt from 'jsonwebtoken';
import { ACCESSTOKEN_SECRET, REFETCHTOKEN_SECRET } from './enviroment';
export interface IToken {
    accessToken: string;
    refetchToken: string;
}

export class Token {
    public static genderToken = async (payload: IUserDataToken): Promise<IToken> => {
        const { id } = payload;
        if (id) {
            const accessToken = await jwt.sign({ id: payload.id }, ACCESSTOKEN_SECRET, {
                expiresIn: '1h',
            });
            const refetchToken = await jwt.sign({ id: payload.id }, REFETCHTOKEN_SECRET, {
                expiresIn: '30d',
            });
            return { accessToken, refetchToken };
        }
    };

    public static verifyToken = async (token: string, secret: string): Promise<Boolean> => {
        try {
            const verify = await jwt.verify(token, secret);
            if (verify) {
                return true;
            }
            return false;
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                throw new Error(err.name);
            }
            return false;
        }
    };
}
