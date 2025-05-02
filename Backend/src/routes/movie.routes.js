import { Router } from "express";
import { addmovie,getmovies,getMovieTitles,getMovieById } from "../controller/movie.controller.js";
import { isAdmin } from "../utils/helper.js";

const router = Router();


router.post("/addmovie",isAdmin, addmovie);

router.get("/getmovies", getmovies);

router.get("/getmovietitles", getMovieTitles);

router.get("/getmoviebyid/:movieId", getMovieById);


export default router;
