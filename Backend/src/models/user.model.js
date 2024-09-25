import mongoose, {Schema} from "mongoose";

const UserSchema = new Schema({
    name:{
        type:String,
        required:true,

    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    number:{
        type:String,
        required:true,
        unique:true
    },
    bookings:{
        type:Array,
        default:[],

    }
},{
    timestamps: true
})

export const User = mongoose.model("User", UserSchema);