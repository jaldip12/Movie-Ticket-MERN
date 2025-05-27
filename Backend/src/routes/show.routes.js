import { Router } from "express";
import { createShow, getShows, getShowsByMovie, bookSeats } from "../controller/show.controller.js";
import { isAdmin } from "../utils/helper.js";

const router = Router();


router.post("/", createShow);

router.get("/", getShows);

router.get("/:movieTitle", getShowsByMovie);

router.post("/booking",bookSeats);



export default router;
