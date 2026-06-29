import "dotenv/config";
import { Worker } from "bullmq";
import fs from "fs/promises";
import path from "path";

import { convertImageFile } from "../services/imageService.js";
import { convertDocument } from "../services/documentService.js";
import { convertMedia } from "../services/audiovideoService.js";
import { uploadFileToSupabase, downloadFromSupabase } from "../services/storageService.js";

import { fileRepository } from "../repositories/fileRepository.js";
import { safeDelete } from "../utils/fileUtils.js";
import logger from "../utils/logger.js";
import { redisConnection as connection } from "../config/redis.js";
import { CONVERSION_STATUS } from "../constants/index.js";

const worker = new Worker(
  "conversionQueue",
  async (job) => {
    let localPath;        // downloaded original — must be cleaned up
    let convertedFilePath;

    // originalUrl replaces the old localPath — worker downloads it first
    const { originalUrl, targetFormat, userId, originalName, fileType } = job.data;

    const log = await fileRepository.findLogByJobId(job.id);
    if (!log) throw new Error(`No ConversionLog found for jobId ${job.id}`);

    const file = await fileRepository.findFileById(log.file_id);

    try {
      await fileRepository.updateLogStatus(log, CONVERSION_STATUS.PROCESSING);
      logger.info({ jobId: job.id, fileType, targetFormat }, "Job processing started");

      // Step 1 — Download original from Supabase to container's /tmp
      localPath = await downloadFromSupabase(originalUrl, originalName);
      await fs.access(localPath); // sanity check

      // Step 2 — Convert
      if (fileType.startsWith("image")) {
        convertedFilePath = await convertImageFile(localPath, targetFormat);
      } else if (fileType.startsWith("application") || fileType === "text/plain") {
        const { convertedPath } = await convertDocument(localPath, targetFormat);
        convertedFilePath = convertedPath;
      } else if (fileType.startsWith("video") || fileType.startsWith("audio")) {
        const { outputPath } = await convertMedia(localPath, targetFormat);
        convertedFilePath = outputPath;
      } else {
        throw new Error(`Unsupported file type: ${fileType}`);
      }

      await fs.access(convertedFilePath);

      // Step 3 — Upload converted file to Supabase
      const outName = `${Date.now()}-${path.parse(originalName).name}.${targetFormat}`;
      const fileUrl = await uploadFileToSupabase(convertedFilePath, outName);

      // Step 4 — Update DB
      await fileRepository.updateFileUrl(file, fileUrl);
      await fileRepository.updateLogStatus(log, CONVERSION_STATUS.COMPLETED, {
        converted_file_url: fileUrl,
      });

      logger.info({ jobId: job.id }, "✅ Job completed");
      return { fileUrl, userId };

    } catch (err) {
      logger.error({ jobId: job.id, err: err.message }, "❌ Job failed");
      await fileRepository
        .updateLogStatus(log, CONVERSION_STATUS.FAILED, { error_message: err.message })
        .catch(() => {});
      throw err;

    } finally {
      // Always clean up both temp files
      if (convertedFilePath) await safeDelete(convertedFilePath);
      if (localPath)         await safeDelete(localPath);
    }
  },
  { connection, concurrency: 5 }
);

worker.on("completed", (job) => logger.info({ jobId: job.id }, "✅ BullMQ completed"));
worker.on("failed", (job, err) =>
  logger.error({ jobId: job?.id, err: err.message }, "❌ BullMQ failed")
);

async function recoverStaleLogs() {
  try {
    const [count] = await fileRepository.resetStaleProcessingLogs();
    if (count > 0) logger.warn({ count }, "Recovered stale processing jobs");
  } catch (err) {
    logger.error({ err: err.message }, "Failed to recover stale logs");
  }
}

recoverStaleLogs();

export default worker;