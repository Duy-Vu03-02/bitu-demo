import { statusCode } from '@config/errors';
import express, { Express } from 'express';
import { Server } from 'http';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cors from 'cors';
import routes from './router';

express.response.sendJson = function (error_code: number = 0, status: number = statusCode.OK, message: string = 'OK', data: object) {
    return this.json({ error_code,status, message, ...data });
};

export class ExpressServer {
    private server?: Express;
    private httpServer: Server; //close server

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

    public async kill(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.httpServer) {
                this.httpServer.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    public listen = (app: Express, port: number): Server => {
        console.log('SERVER PORT :: ', port);
        return app.listen(port);
    };
}
