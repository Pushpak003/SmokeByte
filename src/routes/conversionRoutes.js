import express from "express";
import {authMiddleware} from "../middlewares/authMiddleware.js";
import {upload} from "../middlewares/uploadMiddleware.js";
import { convertImage } from "../controllers/conversionController.js";

const router = express.Router();

router.post("/image",authMiddleware,upload.single("file"),convertImage);

export default router;
