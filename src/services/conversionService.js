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
    const originalName = `originals/${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    const originalUrl  = await uploadFileToSupabase(file.path, originalName);

    // Step 2 — Delete local temp file
    await safeDelete(file.path);

    // Step 3 — DB mein pehle record banao (placeholder jobId)
    // Race condition fix: ConversionLog pehle banta hai, phir queue mein job jaati hai
    const { file: dbFile, log } = await fileRepository.createFileWithLog({
      filename:     file.originalname,
      filetype:     file.mimetype,
      filesize:     file.size,
      userId,
      jobId:        "pending",   // placeholder — real jobId neeche update hoga
      targetFormat: fmt,
    });

    // Step 4 — Ab queue mein daalo
    const job = await addToQueue({
      originalUrl,
      targetFormat: fmt,
      userId,
      originalName: file.originalname,
      fileType:     file.mimetype,
      fileSize:     file.size,
    });

    // Step 5 — Real BullMQ job ID se update karo
    await log.update({ bullmq_job_id: String(job.id) });

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