import { UserModel } from '@common/user/user.model';
import { ITicketResponse, IGetTicket, IGetTicketByTime } from './ticket.interface';
import { TicketModel } from './ticket.model';

export class TicketService {
    public static getAllTicket = async (data: IGetTicketByTime) => {
        try {
            const { time } = data;
            if (time) {
                const converTime = new Date(time);
                const firstTime = new Date(converTime.setHours(0, 0, 0, 0));
                const lastTime = new Date(converTime.setHours(23, 59, 59, 999));
                const listTicket: ITicketResponse[] = await TicketModel.find({
                    timeStart: {
                        $gte: firstTime,
                        $lte: lastTime,
                    },
                });
                return listTicket;
            }
            return;
        } catch (err) {
            console.error(err);
        }
    };

    public static getTicketById = async (data: IGetTicket): Promise<ITicketResponse[]> => {
        try {
            const { idUser } = data;
            if (idUser) {
                const listTicket: ITicketResponse[] = await UserModel.findById(idUser);
                if (listTicket) {
                    return listTicket;
                }
            }
            return;
        } catch (err) {
            console.error(err);
        }
    };
}
