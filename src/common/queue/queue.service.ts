import Queue from 'bull';

export class QueueService {
    private static queues: Map<string, Queue.Queue> = new Map<string, Queue.Queue>();

    public static async getQueue<T = unknown>(jobName: string): Promise<Queue.Queue> {
        let queue = QueueService.queues.get(jobName);

        if (!queue) {
            queue = new Queue(jobName, {
                redis: {
                    host: '127.0.0.1',
                    port: 6379,
                },
            });

            // Lang nghe process moi autoremove dc
            // queue.process((job) => {});

            queue.on('error', (error) => console.error(error));
            QueueService.queues.set(jobName, queue);
        }

        return queue;
    }
}
