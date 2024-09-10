import { IUserRegister } from './../common/user/user.interface';
import { BookingEvent } from '@common/booking/booking.event';
import { DatabaseAdapter } from '../common/infrastructure/database.adapter';
import { WorkerServer } from './server';
import { RedisAdapter } from '@common/infrastructure/redis.adapter';
import { TickerEvent } from '@common/ticket/event.ticket';
import { UserEvent } from '@common/user/user.event';

export class Application {
    public static async createApplication(): Promise<WorkerServer> {
        await DatabaseAdapter.connection();
        await RedisAdapter.connect();

        Application.registerEvents();

        const server = new WorkerServer();
        await server.setup();

        return server;
    }

    public static registerEvents() {
        BookingEvent.register();
        TickerEvent.register();
        UserEvent.register();
    }
}
