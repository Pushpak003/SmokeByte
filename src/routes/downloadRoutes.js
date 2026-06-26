import express from "express";
import { downloadFileController } from "../controllers/downloadController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET /download/:fileId
// fileId = files table ID — ownership verified in controller
router.get("/:fileId", authMiddleware, downloadFileController);

export default router;