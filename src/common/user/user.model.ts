import mongoose, {Schema} from "mongoose";

export interface IUserLogin {
    phone: string,
    password: string,
}

export interface IUserRegister{
    phone: string,
    password: string,
    username: string,
}

export interface IUserData extends Document{
    _id: Schema.Types.ObjectId,
    phone: string,
    password: string,
    username: string,
    flight: [{
        idTickket:  Schema.Types.ObjectId 
        idSoftLight:  Schema.Types.ObjectId 
        state:  String
        confirm:  Boolean
    }]
}

const UserSchema = new Schema({
    phone: {type: String, required: true},
    password: {type:String, required: true, select: false},
    username: {type: String},
    flight: [{
        idTickket: {type: Schema.Types.ObjectId, ref: "Ticket"},
        idSoftLight: {type: Schema.Types.ObjectId, ref: "SoftLight"},
        state: {type: String},
        confirm: {type: Boolean}
    }]
},
{
    timestamps: true,
})

export const UserModel = mongoose.model("UserModel", UserSchema);