import mongoose, {Schema} from "mongoose";

const TichketSchema = new Schema({
    timeStart: {type: Date, required: true},
    from: {
        idLocation: {type: Schema.Types.ObjectId, ref: "Location", required: true},
        name: {type:String, required: true},
    },
    to: {
        idLocation: {type: Schema.Types.ObjectId, ref: "Location", required: true},
        name: {type:String, required: true},
    },
    quantity: {type: Number, required: true},
    price: {type: Number, required: true}
}, 
{
    timestamps: true,
})

export const TicketModel = mongoose.model("Ticket", TichketSchema);