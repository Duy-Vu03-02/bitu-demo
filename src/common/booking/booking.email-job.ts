import { QueueService } from '@common/queue/queue.service';
import { SEND_MAIL } from '@common/contstant/event.mailer';
import eventbus from '@common/eventbus';
import { JOB_SEND_MAIL_CONFIRM as Job_Name } from '@config/job';
import { IConfirmSendMail } from './booking.interface';
import { v4 as uuid } from 'uuid';

export class BookingSendMail {
    public static register = (): void => {
        eventbus.on(SEND_MAIL, BookingSendMail.handleSendMail);
    };

    public static handleSendMail = async (data: IConfirmSendMail): Promise<void> => {
        try {
            const queue = await QueueService.getQueue(Job_Name);
            queue.add(
                { email: data.email, timeStart: data.timeStart, from: data.from, to: data.to },
                {
                    jobId: data.email + '-' + uuid(),
                    removeOnComplete: true,
                    attempts: 3,
                    backoff: 1000,
                    removeOnFail: true,
                },
            );
        } catch (err) {
            console.error(err);
        }
    };
}
