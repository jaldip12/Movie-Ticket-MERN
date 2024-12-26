import { Router } from "express";
import Seating from "../models/Seating.model.js";

const routerS = Router();

// Get all seating plans
routerS.get("/seatingplans", async (req, res) => {
    try {
        const seatingPlans = await Seating.find();
        return res.status(200).json({
            statusCode: 200,
            data: seatingPlans,
            message: "Seating plans fetched successfully"
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
});

// Get seating plan by ID
routerS.get("/seatingplans/:id", async (req, res) => {
    try {
        const seatingPlan = await Seating.findById(req.params.id);
        if (!seatingPlan) {
            return res.status(404).json({
                statusCode: 404,
                message: "Seating plan not found"
            });
        }
        return res.status(200).json({
            statusCode: 200,
            data: seatingPlan,
            message: "Seating plan fetched successfully"
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
});

// Create new seating plan
routerS.post("/seatingplans", async (req, res) => {
    try {
        const { name, sections, price } = req.body;

        // Calculate total rows and seats per row
        const totalRows = sections.reduce((max, section) => Math.max(max, section.rows), 0);
        const seatsPerRow = sections.reduce((max, section) => Math.max(max, section.seatsPerRow), 0);

        // Transform sections data to match model schema
        const transformedSections = sections.map(section => ({
            name: section.name,
            rows: section.rows,
            columns: section.seatsPerRow,
            price: price || 0,
            seats: Array.from({ length: section.rows * section.seatsPerRow }, (_, index) => ({
                row: String.fromCharCode(65 + Math.floor(index / section.seatsPerRow)),
                seatNumber: (index % section.seatsPerRow) + 1,
                isAvailable: true,
                isBooked: false,
                isVisible: true
            }))
        }));

        const seatingPlan = await Seating.create({
            name,
            sections: transformedSections,
            totalRows,
            seatsPerRow
        });

        return res.status(201).json({
            statusCode: 201,
            data: seatingPlan,
            message: "Seating plan created successfully"
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
});

// Update seating plan
routerS.put("/seatingplans/:id", async (req, res) => {
    try {
        const { name, sections, price } = req.body;

        // Calculate total rows and seats per row
        const totalRows = sections.reduce((max, section) => Math.max(max, section.rows), 0);
        const seatsPerRow = sections.reduce((max, section) => Math.max(max, section.seatsPerRow), 0);

        // Transform sections data to match model schema
        const transformedSections = sections.map(section => ({
            name: section.name,
            rows: section.rows,
            columns: section.seatsPerRow,
            price: price || 0,
            seats: Array.from({ length: section.rows * section.seatsPerRow }, (_, index) => ({
                row: String.fromCharCode(65 + Math.floor(index / section.seatsPerRow)),
                seatNumber: (index % section.seatsPerRow) + 1,
                isAvailable: true,
                isBooked: false,
                isVisible: true
            }))
        }));

        const updatedPlan = await Seating.findByIdAndUpdate(
            req.params.id,
            {
                name,
                sections: transformedSections,
                totalRows,
                seatsPerRow
            },
            { new: true }
        );

        if (!updatedPlan) {
            return res.status(404).json({
                statusCode: 404,
                message: "Seating plan not found"
            });
        }
        return res.status(200).json({
            statusCode: 200,
            data: updatedPlan,
            message: "Seating plan updated successfully"
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
});

// Delete seating plan
routerS.delete("/seatingplans/:id", async (req, res) => {
    try {
        const deletedPlan = await Seating.findByIdAndDelete(req.params.id);
        if (!deletedPlan) {
            return res.status(404).json({
                statusCode: 404,
                message: "Seating plan not found"
            });
        }
        return res.status(200).json({
            statusCode: 200,
            message: "Seating plan deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: error.message
        });
    }
});

export default routerS;
