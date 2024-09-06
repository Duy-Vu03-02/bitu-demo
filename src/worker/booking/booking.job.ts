import Queue from 'bull';
import BullQueue, { Job, DoneCallback } from 'bull';
import { IBooking, IBookingIdUser } from '@common/booking/booking.interface';
import { QueueService } from '@common/queue/queue.service';
import { JOB_BOOKING as Job_Name } from '@config/job';

export class BookingJob {
    private static queue: Queue.Queue<IBooking>;
    private static delayJOb: number = 1000 * 60 * 5;

    public static register = async (): Promise<Queue.Queue> => {
        const currentJob = await QueueService.getQueue(Job_Name);
        currentJob.process((job: Job, done: DoneCallback) => {done()});
        return currentJob;
    };

    public static handler = async (job: Job<unknown>, done: DoneCallback): Promise<void> => {
        try {
        } catch (err) {
            console.error(err);
        }
    };

    public static getJob = async (): Promise<Queue.Queue> => {
        if (!BookingJob.queue) {
            const currentJob = await QueueService.getQueue(Job_Name);
            return currentJob;
        }
        return BookingJob.queue;
    };

    public static addJob = async (job: IBooking): Promise<void> => {
        const checkJob = await (await BookingJob.getJob()).getJob(BookingJob.genderIdJob(job as IBooking));
        if (!checkJob && !checkJob?.data) {
            await (
                await BookingJob.getJob()
            ).add(job, {
                delay: BookingJob.delayJOb,
                jobId: BookingJob.genderIdJob(job),
                removeOnComplete: true,
                removeOnFail: true,
            });
        }
    };

    // public static confirmJob = async (job: IBooking): Promise<void> => {
    //     const currentJob = await (await BookingJob.getJob()).getJob(BookingJob.genderIdJob(job));
    //     if (currentJob && currentJob.data) {
    //         await currentJob.remove();
    //     }
    // };

    // public static cancelJob = async (job: IBooking): Promise<void> => {
    //     const currentJob = await (await BookingJob.getJob()).getJob(BookingJob.genderIdJob(job));
    //     if (currentJob && currentJob.data) {
    //         // await BookingService.cancelBooking(job as ICancelBooking);
    //         await currentJob.remove()
    //     }
    // };

    public static genderIdJob = (job: IBooking): string => {
        return job.idUser + '-' + job.idTicket;
    };

    public static getJobByIdUser = async (job: IBookingIdUser): Promise<IBooking[]> => {
        const queuedJobs = await (await BookingJob.getJob()).getJobs(['delayed', 'paused', 'waiting', 'active']);
        const listJobs = await Promise.all(
            queuedJobs.map((item) => {
                if (item.id.toString().includes(job.idUser)) {
                    return item.data;
                }
            }),
        );
        return listJobs;
    };

    public static delBooking = async (job: IBooking): Promise<void> => {
        const currentJob = await (await BookingJob.getJob()).getJob(BookingJob.genderIdJob(job));
        if (currentJob) {
            await currentJob.remove();
        }
    };
}
