import express, { Express } from 'express';
import { Server } from 'http';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cors from 'cors';
import routes from './router';

export class ExpressServer {
    private server?: Server;
    private httpServer: Express; //close server

    public setUp = function async(port: number): Promise<Express> {
        const server = express();

        this.configMiddleware(server);
        this.useRouter(server);
        this.httpServer = this.listen(server, port);
        this.server = server;
        return this.server;
    };

    public useRouter = (app: Express) => {
        app.use(routes);
    };

    public configMiddleware = (app: Express) => {
        app.use(
            cors({
                origin: 'http://localhost:3000',
                credentials: true,
            }),
        );
        app.use(helmet());
        app.use(cookieParser());
        app.use(bodyParser.json());
    };

    public listen = (app: Express, port: number) => {
        app.listen(port, () => {
            console.log('SERVER PORT :: ', port);
        });
    };
}
