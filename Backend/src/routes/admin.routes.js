import {Router} from 'express';
import {createAdmin, getAdmin, logout} from '../controller/admin.controller.js'
import { isAuthenticated } from "../middleware/auth.middleware.js";


const router =Router();

router.post("/registerAdmin", createAdmin);

router.get("/admin", getAdmin);

router.get("/logout", isAuthenticated, logout);

export default router;

