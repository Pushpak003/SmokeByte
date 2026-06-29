import { addToQueue } from "../jobs/conversionQueue.js";
import { fileRepository } from "../repositories/fileRepository.js";
import { uploadFileToSupabase } from "./storageService.js";
import { safeDelete } from "../utils/fileUtils.js";
import {
  ALLOWED_IMAGE_FORMATS,
  ALLOWED_DOCUMENT_FORMATS,
  ALLOWED_MEDIA_FORMATS,
  CONVERSION_STATUS,
} from "../constants/index.js";
import File from "../models/fileModel.js";

const FORMAT_MAP = {
  image:    ALLOWED_IMAGE_FORMATS,
  document: ALLOWED_DOCUMENT_FORMATS,
  media:    ALLOWED_MEDIA_FORMATS,
};

export const conversionService = {
  async queueConversion({ file, targetFormat, userId, category }) {
    const allowed = FORMAT_MAP[category];
    if (!allowed)
      throw Object.assign(new Error("Invalid conversion category"), { statusCode: 400 });

    const fmt = targetFormat?.toLowerCase();
    if (!allowed.includes(fmt)) {
      throw Object.assign(
        new Error(`Invalid target format "${fmt}". Allowed: ${allowed.join(", ")}`),
        { statusCode: 400 }
      );
    }

    // Step 1 — Upload original file to Supabase
    // This replaces the old localPath approach so the worker can run
    // in a separate container with no shared filesystem.
    const originalName = `originals/${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    const originalUrl  = await uploadFileToSupabase(file.path, originalName);

    // Step 2 — Delete local temp file — no longer needed
    await safeDelete(file.path);

    // Step 3 — Queue job with Supabase URL instead of local path
    const job = await addToQueue({
      originalUrl,                   // ← worker downloads this
      targetFormat: fmt,
      userId,
      originalName: file.originalname,
      fileType:     file.mimetype,
      fileSize:     file.size,
    });

    // Step 4 — Create File + ConversionLog with status "pending"
    await fileRepository.createFileWithLog({
      filename:     file.originalname,
      filetype:     file.mimetype,
      filesize:     file.size,
      userId,
      jobId:        job.id,
      targetFormat: fmt,
    });

    return { jobId: job.id };
  },

  async getStatus(jobId) {
    const log = await fileRepository.findLogByJobId(jobId);
    if (!log) return null;

    const result = { status: log.status, jobId };

    if (log.status === CONVERSION_STATUS.COMPLETED) {
      result.fileId       = log.file_id;
      result.targetFormat = log.target_format;
      const file          = await File.findByPk(log.file_id, { attributes: ["filename"] });
      result.filename     = file?.filename || "";
    }

    if (log.status === CONVERSION_STATUS.FAILED) {
      result.error = log.error_message || "Conversion failed";
    }

    return result;
  },
};