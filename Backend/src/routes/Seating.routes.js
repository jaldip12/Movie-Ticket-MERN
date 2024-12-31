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
        const seatingPlan = await Seating.findOne({ id: req.params.id });
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
        const { name, sections } = req.body;

        // Validate input
        if (!name || !sections || !Array.isArray(sections)) {
            return res.status(400).json({
                statusCode: 400,
                message: "Invalid input data"
            });
        }

        // Validate sections data against schema requirements
        for (const section of sections) {
            if (!section.name || !section.rows || !section.columns || !section.price) {
                return res.status(400).json({
                    statusCode: 400,
                    message: "Missing required section fields"
                });
            }
            if (section.rows < 1 || section.columns < 1 || section.price < 0) {
                return res.status(400).json({
                    statusCode: 400,
                    message: "Invalid section values"
                });
            }
            if (section.unavailableSeats) {
                for (const unavailableSeat of section.unavailableSeats) {
                    if (!unavailableSeat.row || !Array.isArray(unavailableSeat.seats)) {
                        return res.status(400).json({
                            statusCode: 400,
                            message: "Invalid unavailable seats format"
                        });
                    }
                    if (unavailableSeat.seats.some(seat => seat < 1)) {
                        return res.status(400).json({
                            statusCode: 400,
                            message: "Invalid seat numbers in unavailable seats"
                        });
                    }
                }
            }
        }

        // Transform sections data to match model schema
        const transformedSections = sections.map(section => ({
            name: section.name.trim(),
            rows: section.rows,
            columns: section.columns,
            price: section.price,
            unavailableSeats: section.unavailableSeats || []
        }));

        const seatingPlan = await Seating.create({
            name: name.trim(),
            sections: transformedSections
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
        const { name, sections } = req.body;

        // Validate input
        if (!name || !sections || !Array.isArray(sections)) {
            return res.status(400).json({
                statusCode: 400,
                message: "Invalid input data"
            });
        }

        // Validate sections data against schema requirements
        for (const section of sections) {
            if (!section.name || !section.rows || !section.columns || !section.price) {
                return res.status(400).json({
                    statusCode: 400,
                    message: "Missing required section fields"
                });
            }
            if (section.rows < 1 || section.columns < 1 || section.price < 0) {
                return res.status(400).json({
                    statusCode: 400,
                    message: "Invalid section values"
                });
            }
            if (section.unavailableSeats) {
                for (const unavailableSeat of section.unavailableSeats) {
                    if (!unavailableSeat.row || !Array.isArray(unavailableSeat.seats)) {
                        return res.status(400).json({
                            statusCode: 400,
                            message: "Invalid unavailable seats format"
                        });
                    }
                    if (unavailableSeat.seats.some(seat => seat < 1)) {
                        return res.status(400).json({
                            statusCode: 400,
                            message: "Invalid seat numbers in unavailable seats"
                        });
                    }
                }
            }
        }

        // Transform sections data to match schema
        const transformedSections = sections.map(section => ({
            name: section.name.trim(),
            rows: section.rows,
            columns: section.columns,
            price: section.price,
            unavailableSeats: section.unavailableSeats || []
        }));

        const updatedPlan = await Seating.findOneAndUpdate(
            { id: req.params.id },
            {
                name: name.trim(),
                sections: transformedSections
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
        const deletedPlan = await Seating.findOneAndDelete({ id: req.params.id });
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
