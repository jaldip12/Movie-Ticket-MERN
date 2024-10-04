import { Router } from "express";
import { addmovie,getmovies } from "../controller/movie.controller.js";

const routerM = Router();

routerM.route("/addmovie").post(addmovie)

routerM.route("/getmovies").get(getmovies)

export default routerM;
