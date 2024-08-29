import { Request, Response } from 'express';
import { ITicket, ITicketResponse, IGetTicket, IGetTicketByTime } from '@common/ticket/ticket.interface';
import { TicketService } from '@common/ticket/ticket.service';
import { statusCode } from '@config/errors';

export class TicketController {
    public static getAllTicket = async (req: Request, res: Response): Promise<void> => {
        try {
            const listTicket: ITicketResponse[] = await TicketService.getAllTicket(req.body as IGetTicketByTime);
            res.status(statusCode.OK).json(listTicket);
        } catch (err) {
            console.error(err);
        }
    };

    public static getTicketByID = async (req: Request, res: Response): Promise<void> => {
        try {
            const listTicket: ITicketResponse[] = await TicketService.getTicketById(req.body as IGetTicket);
            if (listTicket) {
                res.status(statusCode.OK).json(listTicket);
            } else {
                res.status(statusCode.REQUEST_NOT_FOUND);
            }
        } catch (err) {
            console.error(err);
        }
    };
}
