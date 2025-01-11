import { Router } from "express";
import { createSeatingPlan, updateSeatingPlan, deleteSeatingPlan, getAllSeatingPlans, getSeatingPlanByName } from "../controller/seating.controller.js";

const routerS = Router();

routerS.route("/seatingplans")
    .post(createSeatingPlan)
    .get(getAllSeatingPlans);

routerS.route("/seatingplans/:id")
    .put(updateSeatingPlan)
    .delete(deleteSeatingPlan)
    // .get(getSeatingPlanById);

routerS.route("/seatingplans/:name")
    .get(getSeatingPlanByName);

export default routerS;
