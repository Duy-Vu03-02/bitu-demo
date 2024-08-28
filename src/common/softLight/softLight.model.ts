import mongoose, {Schema} from "mongoose";

const softLightSchema = new Schema({
    idUser: {type: Schema.Types.ObjectId, ref: "User"},
    idTicket: {type: Schema.Types.ObjectId, ref: "Ticket"},
    state: {type: String},
    createdAt: { type: Date, default: Date.now, expires: 300, select: true },
    confirm: { type: Boolean, default: false, select: true },
},
{
    timestamps: true,
})

export const SoftLightModel = mongoose.model("SoftLight", softLightSchema);