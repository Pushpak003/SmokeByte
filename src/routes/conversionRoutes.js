import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { validateMagicBytes } from "../middlewares/magicBytesMiddleware.js";
import { uploadLimiter } from "../middlewares/rateLimit.js";
import { convertFile } from "../controllers/conversionController.js";
import {
  imageConversionSchema,
  documentConversionSchema,
  mediaConversionSchema,
} from "../validations/conversionValidation.js";

const router = express.Router();

const setCategory = (category) => (req, res, next) => {
  req.conversionCategory = category;
  next();
};

router.post(
  "/image",
  authMiddleware,
  uploadLimiter,           // max 20 uploads/hr
  upload.single("file"),
  validateMagicBytes,      // verify actual file content
  validate(imageConversionSchema),
  setCategory("image"),
  convertFile
);

router.post(
  "/document",
  authMiddleware,
  uploadLimiter,
  upload.single("file"),
  validateMagicBytes,
  validate(documentConversionSchema),
  setCategory("document"),
  convertFile
);

router.post(
  "/media",
  authMiddleware,
  uploadLimiter,
  upload.single("file"),
  validateMagicBytes,
  validate(mediaConversionSchema),
  setCategory("media"),
  convertFile
);

export default router;