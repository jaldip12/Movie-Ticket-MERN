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
    city:{
        type:String,
        required:true,
    },
    gender:{
        type:String,
        required:true,
        enum:["male", "female", "other"]
    },
    bookings:{
        type:Array,
        default:[],
    },
    role:{
        type:String,
        default:"user"
    }
},{
    timestamps: true
})

const User = mongoose.model("User", UserSchema);

export default User;