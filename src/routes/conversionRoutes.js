import express from "express";
import {authMiddleware} from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import { convertImage } from "../controllers/imageconversionController.js";
import {documentConversionController} from "../controllers/documentController.js";
import { mediaConversionController } from "../controllers/audiovideoController.js";
const router = express.Router();

router.post("/image",authMiddleware,upload.single("file"),convertImage);
router.post("/document",authMiddleware, upload.single("file"), documentConversionController);
router.post("/media",authMiddleware, upload.single("file"),mediaConversionController);
export default router;
