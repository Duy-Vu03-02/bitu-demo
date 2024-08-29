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
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (doc, ret) => {
                ret.id = ret._id;
                delete ret._id;
            },
        },
    },
);

export const TicketModel = mongoose.model<ITicket>('Ticket', TicketSchema);
