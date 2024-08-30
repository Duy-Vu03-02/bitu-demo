import { BookingEvent } from '@common/booking/booking.event';
import { ExpressServer } from './server';
import { DatabaseConnect } from '@common/infrastructure/database';
import { PORT } from '@config/enviroment';
import { TicketCron } from '@common/ticket/ticket.cron';
import { QueueService } from '@common/queue/queue.service';

export class Application {
    public static createApplication = async (): Promise<ExpressServer> => {
        await DatabaseConnect.connectionDB();

        Application.registerEvent();
        Application.registerCron();
        Application.registerQueueJob();

        const expressServer = new ExpressServer();
        expressServer.setUp(PORT);

        return expressServer;
    };

    public static registerEvent = () => {
        BookingEvent.register();
    };

    public static registerCron = () => {
        TicketCron.register();
    };

    public static registerQueueJob = () => {
        QueueService.register();
    };
}
