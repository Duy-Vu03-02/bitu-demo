import { ExpressServer } from './server';
import { DatabaseConnect } from '@common/infrastructure/database';
import { PORT } from '@config/enviroment';

export class Application {
    public static createApplication = async (): Promise<ExpressServer> => {
        await DatabaseConnect.connectionDB();

        this.registerEvent();

        const expressServer = new ExpressServer();
        expressServer.setUp(PORT);

        return expressServer;
    };

    public static registerEvent = () => {};
}
