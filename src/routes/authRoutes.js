import {register,login} from "../controllers/authController.js";
import {Router} from "express";

const router = Router();

router.post('/signup',register);
router.post('/login',login);

export default router;