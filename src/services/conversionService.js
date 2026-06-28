import { addToQueue } from "../jobs/conversionQueue.js";
import { fileRepository } from "../repositories/fileRepository.js";
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

    // Step 1: Queue the job first to get a jobId
    const job = await addToQueue({
      localPath:    file.path,
      targetFormat: fmt,
      userId,
      originalName: file.originalname,
      fileType:     file.mimetype,
      fileSize:     file.size,
    });

    // Step 2: Create File + ConversionLog immediately with status "pending"
    // KEY FIX: This happens in the controller (before response) so when
    // frontend polls /status/:jobId, the log already exists — no 404.
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