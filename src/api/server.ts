import express, { Express } from 'express';
import { Server } from 'http';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cors from 'cors';
import routes from './router';
import { ResponseMiddleware } from './response.middleware';

express.response.sendJson = function (data: object) {
    return this.json({ error_code: 0, message: 'OK', ...data });
};

export class ExpressServer {
    private server?: Express;
    private httpServer: Server; 

    public setUp = function async(port: number): Promise<Express> {
        const server = express();

        this.configMiddleware(server);
        this.useRouter(server);
        this.setupErrorHandlers(server)

        this.httpServer = this.listen(server, port);
        this.server = server;
        return this.server;
    };

    public useRouter = (server: Express) => {
        server.use(routes);
    };

    public configMiddleware = (server: Express) => {
        server.use(
            cors({
                origin: 'http://localhost:3000',
                credentials: true,
            }),
        );
        server.use(helmet());
        server.use(cookieParser());
        server.use(express.json());
        server.use(express.urlencoded({ extended: true }));
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

    public listen = (server: Express, port: number): Server => {
        console.log('SERVER PORT :: ', port);
        return server.listen(port);
    };

    private setupErrorHandlers(server: Express) {
        server.use(ResponseMiddleware.handler);
    }
}
