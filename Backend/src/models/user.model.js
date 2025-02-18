import mongoose, {Schema} from "mongoose";

const UserSchema = new Schema({
    firstname:{
        type:String,
        required:true,

    },
    lastname:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    number:{
        type:String,
        required:true,
        unique:true
    },
    gender:{
        type:String,
        required:true,
        enum:["male", "female", "other"]
    },
    role:{
        type:String,
        enum: ["user", "admin"],
        default:"user"
    }
},{
    timestamps: true
})

const User = mongoose.model("User", UserSchema);

export default User;