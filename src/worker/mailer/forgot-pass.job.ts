import { QueueService } from '@common/queue/queue.service';
import { IUserForgorPassword } from '@common/user/user.interface';
import { DoneCallback, Job } from 'bull';
import nodemailer from 'nodemailer';
import { Queue } from 'bull';
import { EMAIL_ACCOUNT, EMAIL_PASSWORD } from '@config/enviroment';
import { JobContant } from '@common/contstant/job.contant';

export class MailerForgotPassword {
    public static async register(): Promise<Queue<unknown>> {
        const queue = await QueueService.getQueue(JobContant.JOB_FORGOT_PASSWORD);
        await queue.process(MailerForgotPassword.handler);

        return queue;
    }

    public static handler = async (job: Job<IUserForgorPassword>, done: DoneCallback): Promise<void> => {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                host: 'smtp.gmail.com',
                port: 587,
                secure: true,
                auth: {
                    user: EMAIL_ACCOUNT,
                    pass: EMAIL_PASSWORD,
                },
            });

            const infor = await transporter.sendMail({
                from: `Ngô Duy Vũ <${EMAIL_ACCOUNT}>`,
                to: job.data.email,
                subject: 'XÁC THỰC TÀI KHOẢN ✔',
                text: 'XÁC THỰC TÀI KHOẢN',
                html: `
                <h2>Ban da yeu cau xac thuc tai khoan dat ve</h2>
                <h3>Ma OTP cua ban la: <p style="background-color:green; padding:10px;box-sizing: border-box;">${job.data.otp}</p></h3>`,
            });

            console.log(infor.messageId);
            done();
        } catch (err) {
            console.error(err);
        }
    };
}
