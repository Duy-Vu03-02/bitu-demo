import Queue from 'bull';
import BullQueue, { Job } from 'bull';
import { IBooking, IBookingIdUser, ICancelBooking, IConfirmBooking } from '@common/booking/booking.interface';
import { BookingService } from '@common/booking/booking.service';


export class QueueService {
    private static queue: Queue.Queue<IBooking>;
    private static delayJOb: number = 5 * 1000;

    public static register = (): void => {
        const queue = new Queue<IBooking>('booking', {
            redis: {
                host: '127.0.0.1',
                port: 6379,
            },
        });
        QueueService.queue = queue;

        queue.on("completed", (job)=>{
            console.log(job.data)
        })
    };

    public static addJob = async (job: IBooking): Promise<void> => {
        const checkJob =await QueueService.queue.getJob(QueueService.genderIdJob(job as IBooking))
        if(!checkJob && !checkJob?.data){
            console.log("add job: ", QueueService.delayJOb);
            await QueueService.queue.add(job, {
                delay: QueueService.delayJOb,
                jobId: QueueService.genderIdJob(job),
                removeOnComplete: true,
                removeOnFail: true,
                attempts: 3,
            });
        }
    };

    public static confirmJob = async (job: IBooking): Promise<void> => {
        const currentJob = await QueueService.queue.getJob(QueueService.genderIdJob(job));
        if (currentJob && currentJob.data) {
            await BookingService.confirmBooking(job as IConfirmBooking);
        }
    };

    public static cancelJob = async (job: IBooking): Promise<void> => {
        const currentJob = await QueueService.queue.getJob(QueueService.genderIdJob(job));
        if (currentJob && currentJob.data) {
            // await BookingService.cancelBooking(job as ICancelBooking);
        }
    };

    public static genderIdJob = (job: IBooking): string => {
        return job.idUser + '-' + job.idTicket;
    };

    public static getJobByIdUser = async (job: IBookingIdUser): Promise<IBooking[]> => {
        const queuedJobs = await QueueService.queue.getJobs(['delayed', 'paused', 'waiting', 'active']);
        const listJobs = await Promise.all(
            queuedJobs.map((item) => {
                if (item.id.toString().includes(job.idUser)) {
                    return item.data;
                }
            }),
        );
        return listJobs;
    };

    public static delBooking = async(job: IBooking) : Promise<void> => {
        const currentJob = await QueueService.queue.getJob(QueueService.genderIdJob(job));
        if(currentJob){
            await currentJob.remove();
        }
    }
}
