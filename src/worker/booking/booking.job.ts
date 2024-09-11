import { Queue, Job, DoneCallback } from 'bull';
import { QueueService } from '@common/queue/queue.service';
import { JobContant } from '@common/contstant/job.contant';

export class BookingJob {
    public static register = async (): Promise<Queue<unknown>> => {
        const currentJob = await QueueService.getQueue(JobContant.JOB_BOOKING);
        currentJob.process(BookingJob.handler);
        return currentJob;
    };

    public static handler = async (job: Job<unknown>, done: DoneCallback): Promise<void> => {
        try {
            done();
        } catch (err) {
            console.error(err);
        }
    };
}
