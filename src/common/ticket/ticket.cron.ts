import { LocationModel } from '@common/location/location.model';
import cron from 'node-cron';
import { TicketModel } from './ticket.model';

export class TicketCron {
    public static register = async () => {
        try {
            cron.schedule('0 5-23 * * *', async () => {
                const location = await LocationModel.find();
                const n = location.length;
                if (n > 1) {
                    for (let i = 0; i < n; i++) {
                        for (let j = 0; j < n; j++) {
                            if (i !== j) {
                                console.log('create cron');
                                let currentDate = new Date();
                                const ticket = {
                                    timeStart: currentDate,
                                    from: {
                                        idLocation: location[i]._id,
                                        name: location[i].name,
                                    },
                                    to: {
                                        idLocation: location[j]._id,
                                        name: location[j].name,
                                    },
                                    quantity: 10,
                                    price: 1000000,
                                };
                                await TicketModel.create(ticket);

                                const lastCurrent = new Date();
                                lastCurrent.setDate(currentDate.getDate() - 1);

                                const lastTicket = await TicketModel.find({
                                    timeStart: lastCurrent,
                                });
                                if (lastTicket && lastTicket.length > 0) {
                                    await TicketModel.updateMany(
                                        { _id: { $in: lastTicket.map((ticket) => ticket._id) } },
                                        { $set: { quantity: 0 } },
                                    );
                                }
                            }
                        }
                    }
                }
            });
        } catch (err) {
            console.error(err);
        }
    };
}
