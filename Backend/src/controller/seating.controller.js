import Seating from "../models/seating.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponce.js";

const createSeatingPlan = asyncHandler(async (req, res) => {
    const { name, sections } = req.body;

    // Get the latest id from the database
    const latestPlan = await Seating.findOne().sort({ id: -1 });
    const nextId = latestPlan ? latestPlan.id + 1 : 100; // Start from 100 if no plans exist

    // Validate required fields
    if (!name?.trim() || !sections?.length) {
        return res.status(400).json(
            new ApiResponse(400, null, "Name and sections are required")
        );
    }

    // Validate each section matches schema requirements
    for (const section of sections) {
        if (!section.name?.trim()) {
            return res.status(400).json(
                new ApiResponse(400, null, "Each section must have a name")
            );
        }

        // Validate numeric constraints from schema if provided
        if (section.rows && section.rows < 1) {
            return res.status(400).json(
                new ApiResponse(400, null, "Rows must be greater than 0")
            );
        }
        if (section.columns && section.columns < 1) {
            return res.status(400).json(
                new ApiResponse(400, null, "Columns must be greater than 0")
            );
        }
        if (section.price && section.price < 0) {
            return res.status(400).json(
                new ApiResponse(400, null, "Price must be greater than or equal to 0")
            );
        }

        // Validate unavailable seats structure matches schema
        if (section.unavailableSeats?.length) {
            for (const seat of section.unavailableSeats) {
                if (!seat.row) {
                    return res.status(400).json(
                        new ApiResponse(400, null, "Unavailable seats must have a row")
                    );
                }
                if (!Array.isArray(seat.seats) || seat.seats.some(s => s < 1)) {
                    return res.status(400).json(
                        new ApiResponse(400, null, "Seat numbers must be greater than 0")
                    );
                }
            }
        }
    }

    // Create seating plan with sequential id
    const seatingPlan = await Seating.create({
        id: nextId,
        name: name.trim(),
        sections: sections.map(section => ({
            name: section.name.trim(),
            rows: section.rows || 10,
            columns: section.columns || 10,
            price: section.price || 0,
            unavailableSeats: section.unavailableSeats?.map(seat => ({
                row: seat.row || 'A',
                seats: seat.seats || [1]
            })) || []
        }))
    });

    return res.status(201).json(
        new ApiResponse(201, seatingPlan, "Seating plan created successfully")
    );
});

const updateSeatingPlan = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, sections } = req.body;

    // Validate required fields
    if (!name?.trim() || !sections?.length) {
        return res.status(400).json(
            new ApiResponse(400, null, "Name and sections are required")
        );
    }

    // Validate each section matches schema requirements
    for (const section of sections) {
        if (!section.name?.trim()) {
            return res.status(400).json(
                new ApiResponse(400, null, "Each section must have a name")
            );
        }

        // Validate numeric constraints from schema if provided
        if (section.rows && section.rows < 1) {
            return res.status(400).json(
                new ApiResponse(400, null, "Rows must be greater than 0")
            );
        }
        if (section.columns && section.columns < 1) {
            return res.status(400).json(
                new ApiResponse(400, null, "Columns must be greater than 0")
            );
        }
        if (section.price && section.price < 0) {
            return res.status(400).json(
                new ApiResponse(400, null, "Price must be greater than or equal to 0")
            );
        }

        // Validate unavailable seats structure matches schema
        if (section.unavailableSeats?.length) {
            for (const seat of section.unavailableSeats) {
                if (!seat.row) {
                    return res.status(400).json(
                        new ApiResponse(400, null, "Unavailable seats must have a row")
                    );
                }
                if (!Array.isArray(seat.seats) || seat.seats.some(s => s < 1)) {
                    return res.status(400).json(
                        new ApiResponse(400, null, "Seat numbers must be greater than 0")
                    );
                }
            }
        }
    }

    // Update seating plan preserving schema structure
    const updatedPlan = await Seating.findOneAndUpdate(
        { id },
        {
            name: name.trim(),
            sections: sections.map(section => ({
                name: section.name.trim(),
                rows: section.rows || 10,
                columns: section.columns || 10,
                price: section.price || 0,
                unavailableSeats: section.unavailableSeats?.map(seat => ({
                    row: seat.row || 'A',
                    seats: seat.seats || [1]
                })) || []
            }))
        },
        { new: true, runValidators: true }
    );

    if (!updatedPlan) {
        return res.status(404).json(
            new ApiResponse(404, null, "Seating plan not found")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, updatedPlan, "Seating plan updated successfully")
    );
});

const deleteSeatingPlan = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const deletedPlan = await Seating.findOneAndDelete({ id });
    
    if (!deletedPlan) {
        return res.status(404).json(
            new ApiResponse(404, null, "Seating plan not found")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, null, "Seating plan deleted successfully")
    );
});

const getAllSeatingPlans = asyncHandler(async (req, res) => {
    const seatingPlans = await Seating.find({});

    if (!seatingPlans || seatingPlans.length === 0) {
        return res.status(404).json(
            new ApiResponse(404, null, "No seating plans found")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, seatingPlans, "Seating plans retrieved successfully")
    );
});

const getSeatingPlanById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const seatingPlan = await Seating.findOne({ id });

    if (!seatingPlan) {
        return res.status(404).json(
            new ApiResponse(404, null, "Seating plan not found")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, seatingPlan, "Seating plan retrieved successfully")
    );
});
const getSeatingPlanByName = asyncHandler(async (req, res) => {
    const { name } = req.params;

    // Validate input to ensure `name` is not empty
    if (!name || typeof name !== "string") {
        return res.status(400).json(
            new ApiResponse(400, null, "Invalid name parameter.")
        );
    }

    // Fetch seating plan by name
    const seatingPlan = await Seating.findOne({ name });

    if (!seatingPlan) {
        return res.status(404).json(
            new ApiResponse(404, null, "Seating plan not found")
        );
    }

    return res.status(200).json(
        new ApiResponse(200, seatingPlan, "Seating plan retrieved successfully")
    );
});

export default getSeatingPlanByName;


export {
    createSeatingPlan,
    updateSeatingPlan,
    deleteSeatingPlan,
    getAllSeatingPlans,
    getSeatingPlanById,
    getSeatingPlanByName
};
