import { z } from "zod";
import {
  ALLOWED_IMAGE_FORMATS,
  ALLOWED_DOCUMENT_FORMATS,
  ALLOWED_MEDIA_FORMATS,
} from "../constants/index.js";

export const imageConversionSchema = z.object({
  targetFormat: z.string().transform((v) => v.toLowerCase()).pipe(
    z.enum(ALLOWED_IMAGE_FORMATS, {
      errorMap: () => ({ message: `Allowed image formats: ${ALLOWED_IMAGE_FORMATS.join(", ")}` }),
    })
  ),
});

export const documentConversionSchema = z.object({
  targetFormat: z.string().transform((v) => v.toLowerCase()).pipe(
    z.enum(ALLOWED_DOCUMENT_FORMATS, {
      errorMap: () => ({ message: `Allowed document formats: ${ALLOWED_DOCUMENT_FORMATS.join(", ")}` }),
    })
  ),
});

export const mediaConversionSchema = z.object({
  targetFormat: z.string().transform((v) => v.toLowerCase()).pipe(
    z.enum(ALLOWED_MEDIA_FORMATS, {
      errorMap: () => ({ message: `Allowed media formats: ${ALLOWED_MEDIA_FORMATS.join(", ")}` }),
    })
  ),
});