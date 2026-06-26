import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getProfile, getUserHistory } from "../controllers/userController.js";

const router = express.Router();

const noCache = (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
};

router.get("/me", noCache, authMiddleware, getProfile);
router.get("/history", authMiddleware, getUserHistory);

export default router;