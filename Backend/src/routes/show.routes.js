import { Router } from "express";
import { createShow, getShows, getShowsByMovie } from "../controller/show.controller.js";
import { isAdmin } from "../utils/helper.js";

const router = Router();


router.post("/",isAdmin, createShow);

router.get("/", isAdmin, getShows);

router.get("/:movieTitle", getShowsByMovie);

export default router;
