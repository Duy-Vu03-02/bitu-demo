import { Queue } from 'bull';
import eventbus from '@common/eventbus';
import {
    IUserResponse,
    IUserLogin,
    IUserRegister,
    ITokenAuthen,
    IUserForgorPassword,
    IUserOTP,
} from './user.interface';
import { UserModel } from './user.model';
import { QueueService } from '@common/queue/queue.service';
import { EventContant } from '@common/contstant/event.contant';
import { JobContant } from '@common/contstant/job.contant';

export class UserService {
    public static login = async (data: IUserLogin): Promise<IUserResponse> => {
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
            const { phone, username, password, email } = data;
            if (phone && username && password) {
                const newUser = await UserModel.create({
                    phone,
                    username,
                    password,
                    email,
                });
                await newUser.save();
                return newUser;
            }
        } catch (err) {
            console.error(err);
        }
    };

    public static loginByToken = async (data: ITokenAuthen) => {};

    public static forgotPassword = async (data: IUserForgorPassword): Promise<boolean> => {
        try {
            const user = await UserModel.findOne({ email: data.email });
            if (user) {
                eventbus.emit(EventContant.FORGOT_PASSWORD, { email: user.email, ip: data.ip } as IUserForgorPassword);
                return true;
            }
        } catch (err) {
            console.error(err);
        }
    };

    public static verifyOTP = async (data: IUserOTP): Promise<unknown> => {
        try {
            const { otp, email, ip } = data;
            if (otp && ip && email) {
                const queue = await QueueService.getQueue(JobContant.JOB_FORGOT_PASSWORD);
                const idJob = email + '-' + ip;
                const job = await queue.getJob(idJob);

                if (job && job.data) {
                    if (job.data.otp === otp) {
                        const user = (await UserModel.findOne({ email })).toJSON();
                        if (user) {
                            return user;
                        }
                    }
                }
            }
            return false;
        } catch (err) {
            console.error(err);
        }
    };
}
