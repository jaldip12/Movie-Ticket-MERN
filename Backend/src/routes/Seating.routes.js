import { Router } from "express";
import { createSeatingPlan, updateSeatingPlan, deleteSeatingPlan, getAllSeatingPlans,getSeatingPlanById, getSeatingPlanByName } from "../controller/seating.controller.js";
import { isAdmin } from "../utils/helper.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = Router();

// router.use(isAuthenticated)

router.post("/seatingplans",isAdmin, createSeatingPlan);

router.get("/seatingplans", getAllSeatingPlans);

router.put("/seatingplans/:id", isAdmin, updateSeatingPlan);

router.delete("/seatingplans/:id", isAdmin, deleteSeatingPlan);

router.get("/seatingplans/:id", getSeatingPlanById);

router.get("/seatingplans/name/:name", getSeatingPlanByName);

export default router;
