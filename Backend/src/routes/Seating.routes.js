import { Router } from "express";
import { createSeatingPlan, updateSeatingPlan, deleteSeatingPlan, getAllSeatingPlans,getSeatingPlanById, getSeatingPlanByName } from "../controller/seating.controller.js";
import { isAdmin } from "../utils/helper.js";

const router = Router();


router.post("/seatingplans",isAdmin, createSeatingPlan);

router.get("/seatingplans",isAdmin, getAllSeatingPlans);

router.put("/seatingplans/:id", isAdmin, updateSeatingPlan);

router.delete("/seatingplans/:id", isAdmin, deleteSeatingPlan);

router.get("/seatingplans/:id", getSeatingPlanById);

router.get("/seatingplans/name/:name", getSeatingPlanByName);

export default router;
