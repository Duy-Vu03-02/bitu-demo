import Queue from 'bull';
import { IBooking, IConfirmBooking } from '@common/booking/booking.interface';
import { RedisConnect } from '@common/infrastructure/redis';
import { BookingService } from '@common/booking/booking.service';

export class QueueService {
    private static queue: Queue.Queue<IBooking>;
    private static delayJOb: number = 10 * 1000;

    public static register = (): void => {
        const queue = new Queue<IBooking>('my-queue', {
            redis: {
                host: '127.0.0.1',
                port: 6379,
            },
        });
        QueueService.queue = queue;

        queue.process((job) => {
            console.log(job.id);
            console.log(job.data);
            setTimeout(() => {
                job.remove();
            }, 2000);
        });

        // QueueService.addJob({
        //     idUser: '1234',
        //     idTicket: '4321',
        // });
        // setTimeout(() => {
        //     QueueService.addJob({
        //         idUser: '12345',
        //         idTicket: '54321',
        //     });
        // }, 2000)
    };

    public static addJob = async (job: IBooking): Promise<void> => {
        QueueService.queue.add(job, {
            delay: this.delayJOb,
        });
    };

    public static confirmJob = async (job: IBooking): Promise<void> => {
        await BookingService.confirmBooking(job as IConfirmBooking);
    };
}
