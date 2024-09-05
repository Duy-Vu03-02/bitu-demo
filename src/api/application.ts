import { BookingEvent } from '@common/booking/booking.event';
import { ExpressServer } from './server';
import { DatabaseConnect } from '@common/infrastructure/database';
import { PORT } from '@config/enviroment';
import { TicketCron } from '@common/ticket/ticket.cron';
import { QueueService } from '@common/queue/queue.service';
import { TickerEvent } from '@common/ticket/event.ticket';
import { BookingSendMail } from '@common/booking/booking.email-job';

export class Application {
    public static createApplication = async (): Promise<ExpressServer> => {
        await DatabaseConnect.connectionDB();

        Application.registerEvent();
        Application.registerCron();

        const expressServer = new ExpressServer();
        expressServer.setUp(PORT);

        return expressServer;
    };

    public static registerEvent = () => {
        BookingEvent.register();
        TickerEvent.register();
        BookingSendMail.register();
    };

    public static registerCron = () => {
        TicketCron.register();
    };
}
