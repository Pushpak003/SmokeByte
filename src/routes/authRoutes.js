import {register,login,refreshToken} from "../controllers/authController.js";
import {Router} from "express";

const router = Router();

router.post('/signup',register);
router.post('/login',login);
router.post("/refresh-token",refreshToken);

export default router;