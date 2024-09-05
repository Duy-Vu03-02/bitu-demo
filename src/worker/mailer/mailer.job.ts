import { QueueService } from '@common/queue/queue.service';
import { DoneCallback, Job, Queue } from 'bull';
import { JOB_MAILER as Job_Name } from '@config/job';
import nodemailer, { Transporter } from 'nodemailer';

export class MailerJob {
    public static async register(): Promise<Queue<unknown>> {
        const queue = await QueueService.getQueue(Job_Name);
        console.log(queue.name)
        
        await queue.process(MailerJob.handler);
        queue.on('failed', (e) => {
            console.log(e);
        });
        // queue.on('error', (e) => console.log(e));
        queue.on("completed", (job) => {
            console.log(job.name)
        })
        return queue;
    }

    public static handler = async (job: Job<unknown>, done: DoneCallback): Promise<void> => {
        try {
            console.log(job.data);
            const transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 465,
                secure: true,
                auth: {
                    user: 'duy225590@gmail.com',
                    pass: 'duyduy0202..',
                },
            });

            const infor = await transporter.sendMail({
                from: 'duy225590@gmail.com',
                to: 'vungovu00@gmail.com',
                subject: 'Hello ✔', // Subject line
                text: 'Hello world?', // plain text body
                html: '<b>Hello world?</b>', // html body
            });

            console.log(infor.messageId);
            done();
        } catch (err) {
            console.error(err);
        }
    };
}
