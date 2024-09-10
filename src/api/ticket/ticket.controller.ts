import { Request, Response } from 'express';
import { ITicket, ITicketResponse, IGetTicket, IGetTicketByTime } from '@common/ticket/ticket.interface';
import { TicketService } from '@common/ticket/ticket.service';
import { statusCode } from '@config/errors';

export class TicketController {
    public static getAllTicket = async (req: Request, res: Response): Promise<void> => {
        try {
            const listTicket = await TicketService.getAllTicket(req.body as IGetTicketByTime);
            res.sendJson({
                data: listTicket,
            });
        } catch (err) {
            res.sendJson({
                message: err.message,
                status: statusCode.SERVER_ERROR,
            });
        }
    };
}
