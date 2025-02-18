import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    city:{
        type:String,
        required:true,
    },
    bookings:{
        type:Array,
        default:[],
    },
    payment:{
        type:Array,
        default:[],
    },
    points:{
        type:Number,
        default:0
    },

},{
    timestamps: true
})

const Client = mongoose.model("Client", ClientSchema);

export default Client;