import { IUserDataToken } from '@common/user/user.interface';
import jwt from 'jsonwebtoken';
import { ACCESS_TOKEN, REFETCH_TOKEN } from './enviroment';
export interface IToken {
    accessToken: string;
    refetchToken: string;
}

export class Token {
    public static genderToken = async (payload: IUserDataToken): Promise<IToken> => {
        const {id} = payload;
        if(id){
            const accessToken = await jwt.sign(payload, ACCESS_TOKEN, {
                expiresIn: '30s',
            });
            const refetchToken = await jwt.sign(payload, REFETCH_TOKEN, {
                expiresIn: '30d',
            });
            return { accessToken, refetchToken };
        }
    };

    public static verifyToken = async (token: string): Promise<Boolean> => {
        try {
            const verify = await jwt.verify(token);
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
