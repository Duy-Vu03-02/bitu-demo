import { IUserData, IUserLogin, IUserRegister } from "./user.model";
import { UserModel } from "./user.model";
import { Token } from "@config/token";

export class UserService{
    public static login = async(data: IUserLogin) => {
        try{
            const {phone, password} = data;
            if(phone && password){
                const user = await UserModel.findOne({phone, password}).select("password");
    
                if(user){
                    return user;
                }
            }
            return;
        }
        catch(err){
            console.error(err);
        }
    }

    public static register = async(data: IUserRegister): Promise<IUserData>  => {
        try{
            const {phone, username, password} = data;
            if(phone && username && password){
                const newUser = await UserModel.create({
                    phone, username, password
                });
                await newUser.save();
                return newUser;
            }
        }
        catch(err){
            console.error(err);
        }
    }
}