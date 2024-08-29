import { AUTOMATIC_INCREASE, AUTOMATIC_REDUCTION } from '@common/contstant/event.ticket';
import eventbus from '@common/eventbus';
import { IAutoIncrease, IAutoReduction } from './ticket.interface';
import { TicketModel } from './ticket.model';

export class TickerEvent {
    public static register = async () => {
        eventbus.on(AUTOMATIC_REDUCTION, TickerEvent.handleReuction);
        eventbus.on(AUTOMATIC_INCREASE, TickerEvent.handleIncrease);
    };

    public static handleReuction = async (data: IAutoReduction): Promise<void> => {
        try {
            const { idTicket } = data;
            if (idTicket) {
                await TicketModel.findByIdAndUpdate(idTicket, {
                    $inc: { quantity: -1 },
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    public static handleIncrease = async (data: IAutoIncrease): Promise<void> => {
        try {
            const { idTicket } = data;
            if (idTicket) {
                await TicketModel.findByIdAndUpdate(idTicket, {
                    $inc: { quantity: 1 },
                });
            }
        } catch (err) {
            console.error(err);
        }
    };
}
