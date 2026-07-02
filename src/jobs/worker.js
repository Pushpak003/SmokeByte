import "dotenv/config";
import http from "http";
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

// ── Dummy HTTP server — Render Web Service ke liye zaruri ─────────────────────
// Worker ko free tier pe deploy karne ke liye Web Service use karna padta hai
// Background Worker paid hai — yeh dummy server Render ka health check pass karta hai
const PORT = process.env.PORT || 3001;
http.createServer((_, res) => res.writeHead(200).end("worker ok")).listen(PORT, () => {
  logger.info({ port: PORT }, "Worker health server listening");
});
// ─────────────────────────────────────────────────────────────────────────────

const worker = new Worker(
  "conversionQueue",
  async (job) => {
    let localPath;
    let convertedFilePath;

    const { originalUrl, targetFormat, userId, originalName, fileType } = job.data;

    const log = await fileRepository.findLogByJobId(job.id);
    if (!log) throw new Error(`No ConversionLog found for jobId ${job.id}`);

    const file = await fileRepository.findFileById(log.file_id);

    try {
      await fileRepository.updateLogStatus(log, CONVERSION_STATUS.PROCESSING);
      logger.info({ jobId: job.id, fileType, targetFormat }, "Job processing started");

      // Download original from Supabase to container /tmp
      localPath = await downloadFromSupabase(originalUrl, originalName);
      await fs.access(localPath);

      // Convert
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

      // Upload converted file to Supabase
      const outName = `${Date.now()}-${path.parse(originalName).name}.${targetFormat}`;
      const fileUrl = await uploadFileToSupabase(convertedFilePath, outName);

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
      if (convertedFilePath) await safeDelete(convertedFilePath);
      if (localPath) await safeDelete(localPath).catch(() => {});
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