import {Router} from 'express';
import {createAdmin, getAdmin, logout, pingAdmin} from '../controller/admin.controller.js'
import { isAdminAuthenticated } from "../middleware/authadmin.middleware.js";


const router =Router();

router.post("/registerAdmin", createAdmin);

router.post("/login", getAdmin);

router.get("/logout", isAdminAuthenticated, logout);

router.get("/pingAdmin", isAdminAuthenticated,pingAdmin);

export default router;

