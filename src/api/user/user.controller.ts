import { IUserLogin } from "@common/user/user.model";
import { UserService } from "@common/user/user.service";
import { Response, Request } from "express";
import { Token } from "@config/token";
import { IUserDataToken } from "@common/user/user.interface";
import { statusCode } from "@config/errors";

export class UserController {
    public static login = async(req: Request, res: Response) : Promise<void> =>{
         const user = await UserService.login(req.body as IUserLogin);
        if(user){
            const {accessToken, refetchToken} = await Token.genderToken(user as IUserDataToken); 
                res.cookie("accessToken", accessToken, {
                    maxAge: 1000 * 30,
                });
                res.cookie("refetchToken", refetchToken, {
                    maxAge: 1000 * 60 * 60 * 24 * 30,
                })
                res.status(statusCode.OK).json(user);
        }
    }

    public static register = async(req: Request, res: Response): Promise<void> => {
        // const newUser = await 
    }
}