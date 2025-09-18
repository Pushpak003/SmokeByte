import "dotenv/config";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import fs from "fs/promises";
import path from "path";
import os from "os";
import axios from "axios";
import { convertImageFile } from "./../services/imageService.js";
import { convertDocument } from "./../services/documentService.js";
import { convertMedia } from "./../services/audiovideoService.js";
import { uploadFileToSupabase } from "./../services/storageService.js";
import File from "../models/fileModel.js";
import ConversionLog from "../models/conversionLogs.js";
import { safeDelete } from "../utils/fileUtils.js";

console.log("--- DEBUGGING ---");
console.log("Node.js ke andar REDIS_URL hai =>", process.env.REDIS_URL);
console.log("-----------------");

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

async function downloadFile(fileUrl) {
  const response = await axios.get(fileUrl,{responseType: "arraybuffer"});
  const tempPath = path.join(os.tmpdir(),`${Date.now()}-${path.basename(fileUrl)}`);
  await fs.writeFile(tempPath, Buffer.from(response.data));
  return tempPath;
}
const worker = new Worker(
  "conversionQueue",
  async (job) => {
    const { fileUrl:inputFileUrl, targetFormat, userId, originalName, fileType, fileSize } = job.data;

    const filePath = await downloadFile(inputFileUrl);
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
    await safeDelete(convertedFilePath);
    await new Promise((res) => setTimeout(res, 300));
    //await safeDelete(filePath);

    return { fileUrl, userId };
  },
  { connection }
);

worker.on("completed", (job, result) => {
  console.log(`✅ Job ${job.id} completed: ${result.fileUrl}`);
});
worker.on("failed", (job, err) => {
  console.log(`❌ Job ${job.id} failed:`, err.message || err);
});

export default worker;
