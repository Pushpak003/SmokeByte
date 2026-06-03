import {register,login,refreshToken,logout} from "../controllers/authController.js";
import {validate} from "../middlewares/validateMiddleware.js";
import { registerSchema, loginSchema } from "../validations/authvalidations.js";
import {Router} from "express";
const router = Router();

router.post('/signup',validate(registerSchema),register);
router.post('/login',validate(loginSchema),login);
router.post("/refresh-token",refreshToken);
router.post('/logout',logout);
export default router;