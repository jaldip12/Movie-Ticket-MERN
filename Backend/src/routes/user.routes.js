import { Router } from "express";
import {registeruser,getUser,logout,pingUser} from '../controller/user.controller.js'
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = Router();


router.post("/register", registeruser);

router.post("/login", getUser);

router.get("/logout",isAuthenticated, logout);

router.get("/ping",isAuthenticated, pingUser);

export default router;