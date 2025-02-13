import mongoose, {Schema} from "mongoose";

const AdminSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        default:"Admin"
    },
    number:{
        type:String,
        required:true
    },
    lastLogin:{
        type:Date,
        default:Date.now()
    },
    refreshToken:{
        type:String
    }},
    {
        timestamps: true
});

const Admin = mongoose.model("Admin", AdminSchema);

export default Admin;
