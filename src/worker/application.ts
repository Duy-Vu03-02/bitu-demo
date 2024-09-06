import { IUserRegister } from './../common/user/user.interface';
import { BookingEvent } from '@common/booking/booking.event';
import { DatabaseConnect } from './../common/infrastructure/database';
import { WorkerServer } from './server';
import { RedisConnect } from '@common/infrastructure/redis';
import { TickerEvent } from '@common/ticket/event.ticket';
import { UserEvent } from '@common/user/user.event';

export class Application {
    public static async createApplication(): Promise<WorkerServer> {
        await DatabaseConnect.connectionDB();
        await RedisConnect.connect();

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
