import { BookingJob } from './booking/booking.job';
import { JobHandler } from './interface';
import { Queue } from 'bull';
import { MailerJob } from './mailer/mailer.job';

export class Router {
    static async register(): Promise<Queue[]> {
        const queues: JobHandler[] = [BookingJob, MailerJob];
        return Promise.all(queues.map(async (queue) => await queue.register()));
    }
}
