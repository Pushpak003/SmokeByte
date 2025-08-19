import express from "express";
import { getConversionStatus } from "../controllers/statusController.js";
import {authMiddleware} from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/:jobId",authMiddleware, getConversionStatus);

export default router;
