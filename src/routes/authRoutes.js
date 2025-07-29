import {register,login,refreshToken,logout} from "../controllers/authController.js";
import {Router} from "express";
const router = Router();

router.post('/signup',register);
router.post('/login',login);
router.post("/refresh-token",refreshToken);
router.post('/logout',logout);
export default router;