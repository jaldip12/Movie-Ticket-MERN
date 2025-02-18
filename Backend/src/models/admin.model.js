import mongoose, {Schema} from "mongoose";

const AdminSchema = new Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    lastLogin:{
        type:Date,
        default:Date.now()
    },
    isActive: {
        type: Boolean,
        default: true
    }, 
    refreshToken:{
        type:String
    }},
    {
        timestamps: true
});

const Admin = mongoose.model("Admin", AdminSchema);

export default Admin;
