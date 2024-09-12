import { ExpressServer } from '@api/server';
import { IUserRegister } from './../common/user/user.interface';
import { BookingEvent } from '@common/booking/booking.event';
import { DatabaseAdapter } from '../common/infrastructure/database.adapter';
import { WorkerServer } from './server';
import { RedisAdapter } from '@common/infrastructure/redis.adapter';
import { TickerEvent } from '@common/ticket/ticket.event';
import { UserEvent } from '@common/user/user.event';

export class Application {
    public static async createApplication(): Promise<WorkerServer> {
        await DatabaseAdapter.connection();
        await RedisAdapter.connect();

        Application.registerEvents();
        
        const server = new WorkerServer();
        Application.handleExit(server)
        await server.setup();

        return server;
    }

    public static registerEvents() {
        BookingEvent.register();
        TickerEvent.register();
        UserEvent.register();
    }

    private static handleExit(express: WorkerServer) {
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

    private static shutdownProperly(exitCode: number, express: WorkerServer) {
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
