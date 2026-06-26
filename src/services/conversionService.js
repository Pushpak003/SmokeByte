import { addToQueue } from "../jobs/conversionQueue.js";
import { uploadFileToSupabase } from "./storageService.js";
import { fileRepository } from "../repositories/fileRepository.js";
import {
  ALLOWED_IMAGE_FORMATS,
  ALLOWED_DOCUMENT_FORMATS,
  ALLOWED_MEDIA_FORMATS,
  CONVERSION_STATUS,
} from "../constants/index.js";
import fs from "fs";

// Maps file mimetype category to its allowed formats
const FORMAT_MAP = {
  image: ALLOWED_IMAGE_FORMATS,
  document: ALLOWED_DOCUMENT_FORMATS,
  media: ALLOWED_MEDIA_FORMATS,
};

export const conversionService = {
  async queueConversion({ file, targetFormat, userId, category }) {
    const allowed = FORMAT_MAP[category];
    if (!allowed) throw Object.assign(new Error("Invalid conversion category"), { statusCode: 400 });

    const fmt = targetFormat?.toLowerCase();
    if (!allowed.includes(fmt)) {
      throw Object.assign(
        new Error(`Invalid target format "${fmt}". Allowed: ${allowed.join(", ")}`),
        { statusCode: 400 }
      );
    }

    // Upload original file to Supabase
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "");
    const fileName = `${Date.now()}-${cleanName}`;
    const fileUrl = await uploadFileToSupabase(file.path, fileName);

    // Remove local temp file
    fs.unlinkSync(file.path);

    // Add to BullMQ queue
    const job = await addToQueue({
      fileUrl,
      targetFormat: fmt,
      userId,
      originalName: file.originalname,
      fileType: file.mimetype,
      fileSize: file.size,
    });

    return { jobId: job.id };
  },

  async getStatus(jobId) {
    const log = await fileRepository.findLogByJobId(jobId);
    if (!log) return null;

    const result = { status: log.status, jobId };
    if (log.status === CONVERSION_STATUS.COMPLETED) result.fileUrl = log.converted_file_url;
    if (log.status === CONVERSION_STATUS.FAILED) result.error = log.error_message || "Conversion failed";
    return result;
  },
};