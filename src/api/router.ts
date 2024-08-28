import express, { Request, Response } from 'express';

const routes = express();

routes.get('/test', (req: Request, res: Response) => {
    res.sendStatus(200);
});

export default routes;
