import "dotenv/config";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import fs from "fs/promises";
import path from "path";
import { convertImageFile } from "./../services/imageService.js";
import { convertDocument } from "./../services/documentService.js";
import { convertMedia } from "./../services/audiovideoService.js";
import { uploadFileToSupabase } from "./../services/storageService.js";
import File from "../models/fileModel.js";
import ConversionLog from "../models/conversionLogs.js";

const connection = new IORedis({ maxRetriesPerRequest: null });

async function waitForFile(filePath, retries = 5, delayMs = 200) {
  for (let i = 0; i < retries; i++) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return false;
}

const worker = new Worker(
  "conversionQueue",
  async (job) => {
    const { filePath, targetFormat, userId, originalName, fileType, fileSize } = job.data;

    const fileExists = await waitForFile(filePath);
    if (!fileExists) throw new Error(`Input file is missing after retries: ${filePath}`);

    let convertedFilePath;

    if (fileType.startsWith("image")) {
      convertedFilePath = await convertImageFile(filePath, targetFormat);
    } else if (fileType.startsWith("application") || fileType === "text/plain") {
      const { convertedPath } = await convertDocument(filePath, targetFormat);
      convertedFilePath = convertedPath;
    } else if (fileType.startsWith("video") || fileType.startsWith("audio")) {
      const { outputPath } = await convertMedia(filePath, targetFormat);
      convertedFilePath = outputPath;
    } else {
      throw new Error("Unsupported file type for conversion");
    }

    // Validate converted file
    await fs.access(convertedFilePath).catch(() => {
      throw new Error(`Converted file missing: ${convertedFilePath}`);
    });

    // Upload to Supabase
    const fileName = `${Date.now()}-${path.parse(originalName).name}.${targetFormat}`;
    const fileUrl = await uploadFileToSupabase(convertedFilePath, fileName);

    // Save DB records
    const fileRecord = await File.create({
      filename: originalName,
      filetype: fileType,
      filesize: fileSize,
      user_id: userId,
      converted_file_url: fileUrl,
    });

    await ConversionLog.create({
      file_id: fileRecord.id,
      target_format: targetFormat,
      status: "completed",
      converted_file_url: fileUrl,
    });

    // Delete files safely
    try {
  await fs.unlink(convertedFilePath);
  console.log(`Deleted converted file: ${convertedFilePath}`);
} catch (e) {
  console.warn(`Converted file already deleted or busy: ${convertedFilePath}`);
}

// Thoda wait for sharp releasing temp file
await new Promise((res) => setTimeout(res, 300));

// Delete original temp file
try {
  await fs.unlink(filePath);
  console.log(`Deleted original temp file: ${filePath}`);
} catch (e) {
  console.warn(`Temp file already deleted or busy: ${filePath}`);
}

    return { fileUrl, userId };
  },
  { connection }
);

worker.on("completed", (job, result) => {
  console.log(`✅ Job ${job.id} completed: ${result.fileUrl}`);
});
worker.on("failed", (job, err) => {
  console.log(`❌ Job ${job.id} failed: ${err.message}`);
});

export default worker;
