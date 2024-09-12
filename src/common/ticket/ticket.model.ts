import { transform } from 'typescript';
import { ITicket, ITicketResponse } from './ticket.interface';
import mongoose, { Schema } from 'mongoose';

const TicketSchema = new Schema(
    {
        timeStart: { type: Date, required: true },
        from: {
            idLocation: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
            name: { type: String, required: true },
        },
        to: {
            idLocation: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
            name: { type: String, required: true },
        },
        quantity: { type: Number, required: true, min: 0 },
        price: { type: Number, required: true },
    },
    {
        timestamps: true,
    },
);

TicketSchema.method({
    transform(): ITicketResponse {
        const transformed: ITicketResponse = {
            id: this._id.toHexString(),
            timeStart: this.timeStart,
            from: {
                idLocation: this.from.idLocation.toHexString(),
                name: this.from.name,
            },
            to: {
                idLocation: this.to.idLocation.toHexString(),
                name: this.to.name,
            },
            quantity: this.quantity,
            price: this.price,
        };
        return transformed;
    },
});

export const TicketModel = mongoose.model<ITicket>('Ticket', TicketSchema);
