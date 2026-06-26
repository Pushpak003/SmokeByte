import express from "express";
import { getStatus } from "../controllers/conversionController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/:jobId", authMiddleware, getStatus);

export default router;