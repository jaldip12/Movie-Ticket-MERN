import { Router } from "express";
import { addmovie,getmovies,getMovieTitles } from "../controller/movie.controller.js";

const routerM = Router();

routerM.route("/addmovie").post(addmovie)

routerM.route("/getmovies").get(getmovies)

routerM.route("/getmovietitles").get(getMovieTitles)

export default routerM;
