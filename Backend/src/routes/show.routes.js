import { Router } from "express";
import { createShow, getShows, getShowsByMovie } from "../controller/show.controller.js";

const router = Router();

router.route("/").post(createShow);
router.route("/").get(getShows);
router.route("/:movieId").get(getShowsByMovie);

export default router;
