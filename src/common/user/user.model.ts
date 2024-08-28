import mongoose, {Schema} from "mongoose";

const UserSchema = new Schema({
    phone: {type: String, required: true},
    authentication : {
        password: {type:String, required: true, select: false}
    },
    username: {type: String},
    flight: {
        idTickket: {type: Schema.Types.ObjectId, ref: "Ticket"},
        idSoftLight: {type: Schema.Types.ObjectId, ref: "SoftLight"},
        state: {type: String},
        confirm: {type: Boolean}
    }
},
{
    timestamps: true,
})

export const UserModel = mongoose.model("UserModel", UserSchema);