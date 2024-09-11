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
                const listTicket = await TicketModel.find({
                    timeStart: {
                        $gte: firstTime,
                        $lte: lastTime,
                    },
                });

                return listTicket.map((ticket) => ticket.transform());
            }
            return [];
        } catch (err) {
            return [];
        }
    };
}
