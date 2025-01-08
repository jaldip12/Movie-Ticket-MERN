import { Router } from "express";
import { addmovie,getmovies,getMovieTitles,getMovieByTitle } from "../controller/movie.controller.js";

const routerM = Router();

routerM.route("/addmovie").post(addmovie)

routerM.route("/getmovies").get(getmovies)

routerM.route("/getmovietitles").get(getMovieTitles)

routerM.route("/getmoviebytitle/:movieTitle").get(getMovieByTitle)

export default routerM;
