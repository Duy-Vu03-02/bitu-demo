import { BookingJob } from './booking/booking.job';
import { JobHandler } from './interface';
import { Queue } from 'bull';
import { MailerConfirmBookingJob } from './mailer/confirm-booking.job';
import { MailerForgotPassword } from './mailer/forgot-pass.job';

export class Router {
    static async register(): Promise<Queue[]> {
        const queues: JobHandler[] = [BookingJob, MailerConfirmBookingJob, MailerForgotPassword];
        return Promise.all(queues.map(async (queue) => await queue.register()));
    }
}
