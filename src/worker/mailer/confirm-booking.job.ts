import { QueueService } from '@common/queue/queue.service';
import { DoneCallback, Job, Queue } from 'bull';
import nodemailer, { Transporter } from 'nodemailer';
import { EMAIL_ACCOUNT, EMAIL_PASSWORD } from '@config/enviroment';
import { IConfirmSendMail } from '@common/booking/booking.interface';
import { JobContant } from '@common/contstant/job.contant';

export class MailerConfirmBookingJob {
    public static async register(): Promise<Queue<unknown>> {
        const queue = await QueueService.getQueue(JobContant.JOB_SEND_MAIL_CONFIRM);
        queue.process(MailerConfirmBookingJob.handler);

        return queue;
    }

    public static handler = async (job: Job<IConfirmSendMail>, done: DoneCallback): Promise<void> => {
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
            const date = new Date(job.data.timeStart);

            const infor = await transporter.sendMail({
                from: `Ngô Duy Vũ <${EMAIL_ACCOUNT}>`,
                to: job.data.email,
                subject: 'XÁC NHẬN ĐẶT VÉ ✔',
                text: 'XÁC NHẬN ĐẶT VÉ',
                html: `
                <h2>Cam on ban da dat ve</h2>
                <p>
                    Diem xuat phat: ${job.data.from}
                </p>
                <p>
                    Diem ben: ${job.data.to}
                </p>
                <p>
                    Thoi gian: ${date.toISOString().split('T')[0]} -- ${date.getHours()}:${date.getMinutes()}
                </p>`,
            });

            console.log(infor.messageId);
            done();
        } catch (err) {
            console.error(err);
        }
    };
}
