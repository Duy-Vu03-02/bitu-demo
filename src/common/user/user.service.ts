import { IUserResponse, IUserLogin, IUserRegister } from './user.interface';
import { UserModel } from './user.model';

export class UserService {
    public static login = async (data: IUserLogin) => {
        try {
            const { phone, password } = data;
            if (phone && password) {
                const user = await UserModel.findOne({ phone, password });

                if (user) {
                    return user.toJSON();
                }
            }
            return;
        } catch (err) {
            console.error(err);
        }
    };

    public static register = async (data: IUserRegister) => {
        try {
            const { phone, username, password } = data;
            if (phone && username && password) {
                const newUser = await UserModel.create({
                    phone,
                    username,
                    password,
                });
                await newUser.save();
                return newUser;
            }
        } catch (err) {
            console.error(err);
        }
    };
}
