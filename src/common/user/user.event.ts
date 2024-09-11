import eventbus from '@common/eventbus';
import { IUserForgorPassword } from './user.interface';
import { QueueService } from '@common/queue/queue.service';

import { v4 as uuid } from 'uuid';
import { EventContant } from '@common/contstant/event.contant';
import { JobContant } from '@common/contstant/job.contant';

export class UserEvent {
    public static register = (): void => {
        eventbus.on(EventContant.FORGOT_PASSWORD, UserEvent.handleForgotPassword);
    };

    public static handleForgotPassword = async (data: IUserForgorPassword) => {
        const queue = await QueueService.getQueue(JobContant.JOB_FORGOT_PASSWORD);
        queue.add(
            {
                ip: data.ip,
                email: data.email,
                otp: uuid(),
            },
            {
                // delay: UserEvent.delays,
                // removeOnComplete: true,
                jobId: data.email + '-' + data.ip,
                attempts: 3,
                backoff: 1000,
                removeOnFail: true,
            },
        );
    };
}
