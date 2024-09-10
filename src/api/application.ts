import { BookingEvent } from '@common/booking/booking.event';
import { DatabaseAdapter } from '@common/infrastructure/database.adapter';
import { PORT } from '@config/enviroment';
import { TicketCron } from '@common/ticket/ticket.cron';
import { TickerEvent } from '@common/ticket/event.ticket';
import { BookingSendMail } from '@common/booking/booking.email-job';
import { UserEvent } from '@common/user/user.event';
import { ExpressServer } from '@api/server';
import { RedisAdapter } from '@common/infrastructure/redis.adapter';

export class Application {
    public static createApplication = async (): Promise<ExpressServer> => {
        await DatabaseAdapter.connection();
        await RedisAdapter.connect();

        Application.registerEvent();
        Application.registerCron();

        const expressServer = new ExpressServer();
        expressServer.setUp(PORT);

        Application.handleExit(expressServer);

        return expressServer;
    };

    public static registerEvent = () => {
        BookingEvent.register();
        TickerEvent.register();
        BookingSendMail.register();
        UserEvent.register();
    };

    public static registerCron = () => {
        TicketCron.register();
    };

    private static handleExit(express: ExpressServer) {
        process.on('uncaughtException', (err: unknown) => {
            console.error('Uncaught exception', err);
            Application.shutdownProperly(1, express);
        });
        process.on('unhandledRejection', (reason: unknown | null | undefined) => {
            console.error('Unhandled Rejection at promise', reason);
            Application.shutdownProperly(2, express);
        });
        process.on('SIGINT', () => {
            console.info('Caught SIGINT, exitting!');
            Application.shutdownProperly(128 + 2, express);
        });
        process.on('SIGTERM', () => {
            console.info('Caught SIGTERM, exitting');
            Application.shutdownProperly(128 + 2, express);
        });
        process.on('exit', () => {
            console.info('Exiting process...');
        });
    }

    private static shutdownProperly(exitCode: number, express: ExpressServer) {
        Promise.resolve()
            .then(() => express.kill())
            .then(() => RedisAdapter.disconnect())
            .then(() => DatabaseAdapter.disconnect())
            .then(() => {
                console.info('Shutdown complete, bye bye!');
                process.exit(exitCode);
            })
            .catch((err) => {
                console.error('Error during shutdown', err);
                process.exit(1);
            });
    }
}
