import express from "express";
import {authMiddleware} from "../middlewares/authMiddleware.js";
import {upload} from "../middlewares/uploadMiddleware.js";
import { convertImage } from "../controllers/imageconversionController.js";
import {documentConversionController} from "../controllers/documentController.js";
const router = express.Router();

router.post("/image",authMiddleware,upload.single("file"),convertImage);
router.post("/document",authMiddleware, upload.single("file"), documentConversionController);

export default router;
