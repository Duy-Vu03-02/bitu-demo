import { QueueService } from '@common/queue/queue.service';
import { SEND_MAIL } from '@common/contstant/event.mailer';
import eventbus from '@common/eventbus';
import { JOB_MAILER as Job_Name } from '@config/job';
import { IBookingSendMai } from './booking.interface';
import { v4 as uuid } from 'uuid';

export class BookingSendMail {
    public static register = (): void => {
        eventbus.on(SEND_MAIL, BookingSendMail.handle);
    };

    public static handle = async (data: IBookingSendMai): Promise<void> => {
        try {
            const queue = await QueueService.getQueue(Job_Name);
            console.log(queue.name);
            queue.add(
                { email: data.email },
                {
                    jobId: data.email + '-' + uuid(),
                    removeOnComplete: true,
                    attempts: 3,
                    backoff: 1000,
                    removeOnFail: true,
                    // delay: 1000 * 5,
                },
            );
        } catch (err) {
            console.error(err);
        }
    };
}
