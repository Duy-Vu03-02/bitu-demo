import { BookingEvent } from '@common/booking/booking.event';
import { ExpressServer } from './server';
import { DatabaseConnect } from '@common/infrastructure/database';
import { PORT } from '@config/enviroment';
import { TicketCron } from '@common/ticket/ticket.cron';

export class Application {
    public static createApplication = async (): Promise<ExpressServer> => {
        await DatabaseConnect.connectionDB();

        this.registerEvent();
        this.registerCron();

        const expressServer = new ExpressServer();
        expressServer.setUp(PORT);

        return expressServer;
    };

    public static registerEvent = () => {
        BookingEvent.register();
    };

    public static registerCron = async () => {
        await TicketCron.register();
    };
}
