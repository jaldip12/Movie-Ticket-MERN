import mongoose from "mongoose";

const seatingSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    sections: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        rows: {
            type: Number,
            required: true,
            min: 1
        },
        columns: {
            type: Number,
            required: true, 
            min: 1
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        seats: [{
            row: Number,
            column: Number,
            seatNumber: String,
            isBlocked: {
                type: Boolean,
                default: false
            },
            isBooked: {
                type: Boolean,
                default: false
            }
        }]
    }]
}, { timestamps: true });

const Seating = mongoose.model("Seating", seatingSchema);
export default Seating;
