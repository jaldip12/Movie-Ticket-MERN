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
            row: {
                type: String,
                required: true
            },
            seatNumber: {
                type: Number,
                required: true,
                min: 1
            },
            isAvailable: {
                type: Boolean,
                default: true
            },
            isBooked: {
                type: Boolean,
                default: false
            },
            isVisible: {
                type: Boolean,
                default: false
            }
        }]
    }],
    totalRows: {
        type: Number,
        required: true
    },
    seatsPerRow: {
        type: Number, 
        required: true
    }
}, { timestamps: true });

const Seating = mongoose.model("Seating", seatingSchema);
export default Seating;
