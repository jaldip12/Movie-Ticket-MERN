import { Router } from "express";
import { addmovie } from "../controller/movie.controller.js";

const routerM = Router();

routerM.route("/addmovie").post(addmovie)

export default routerM;
