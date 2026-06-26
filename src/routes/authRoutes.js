import { register, login, refreshToken, logout, googleAuthCallback } from "../controllers/authController.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { registerSchema, loginSchema } from "../validations/authvalidations.js";
import { authLimiter } from "../middlewares/rateLimit.js";
import { Router } from "express";
import passport from "../config/passport.js";

const router = Router();

// Auth limiter on login/signup — 10 attempts per 15 min (brute force protection)
router.post("/signup", authLimiter, validate(registerSchema), register);
router.post("/login",  authLimiter, validate(loginSchema), login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
  }),
  googleAuthCallback
);

export default router;