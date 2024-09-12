import eventbus from '@common/eventbus';
import { IAutoIncrease, IAutoReduction } from './ticket.interface';
import { TicketModel } from './ticket.model';
import { EventContant } from '@common/contstant/event.contant';

export class TickerEvent {
    public static register = async () => {
        eventbus.on(EventContant.CONFIRM_BOOKING, TickerEvent.handleReuction);
        eventbus.on(EventContant.CANCEL_BOOKING, TickerEvent.handleIncrease);
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
            const { idTicket, flagIncrease } = data;
            if (idTicket && flagIncrease) {
                await TicketModel.findByIdAndUpdate(idTicket, {
                    $inc: { quantity: 1 },
                });
            }
        } catch (err) {
            console.error(err);
        }
    };
}
