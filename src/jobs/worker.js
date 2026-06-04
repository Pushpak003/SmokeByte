import "dotenv/config";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import os from "os";
import axios from "axios";
import sequelize from "../config/db.js";

import { convertImageFile } from "../services/imageService.js";
import { convertDocument } from "../services/documentService.js";
import { convertMedia } from "../services/audiovideoService.js";
import { uploadFileToSupabase } from "../services/storageService.js";

import File from "../models/fileModel.js";
import ConversionLog from "../models/conversionLogs.js";

import { safeDelete } from "../utils/fileUtils.js";

const connection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableOfflineQueue: true,
  ...(process.env.NODE_ENV !== "production"
    ? {
        tls: {
          rejectUnauthorized: false,
        },
      }
    : {}),
});

function validateSupabaseUrl(fileUrl) {
  const url = new URL(fileUrl);
  const supabaseHost = new URL(process.env.SUPABASE_URL).hostname;

  if (url.hostname !== supabaseHost) {
    throw new Error("Only Supabase URLs are allowed");
  }
}

async function downloadFile(fileUrl) {
  validateSupabaseUrl(fileUrl);

  const response = await axios.get(encodeURI(fileUrl), {
    responseType: "arraybuffer",
    timeout: 30000,
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  });

  const tempPath = path.join(
    os.tmpdir(),
    `${Date.now()}-${path.basename(fileUrl)}`
  );

  await fs.writeFile(tempPath, Buffer.from(response.data));

  return tempPath;
}

const worker = new Worker(
  "conversionQueue",
  async (job) => {
    let filePath;
    let convertedFilePath;

    try {
      const {
        fileUrl: inputFileUrl,
        targetFormat,
        userId,
        originalName,
        fileType,
        fileSize,
      } = job.data;

      filePath = await downloadFile(inputFileUrl);

      if (!fsSync.existsSync("public/uploads")) {
        fsSync.mkdirSync("public/uploads", { recursive: true });
      }

      // Convert file
      if (fileType.startsWith("image")) {
        convertedFilePath = await convertImageFile(
          filePath,
          targetFormat
        );
      } else if (
        fileType.startsWith("application") ||
        fileType === "text/plain"
      ) {
        const { convertedPath } = await convertDocument(
          filePath,
          targetFormat
        );

        convertedFilePath = convertedPath;
      } else if (
        fileType.startsWith("video") ||
        fileType.startsWith("audio")
      ) {
        const { outputPath } = await convertMedia(
          filePath,
          targetFormat
        );

        convertedFilePath = outputPath;
      } else {
        throw new Error("Unsupported file type for conversion");
      }

      // Validate output exists
      await fs.access(convertedFilePath);

      // Upload to Supabase
      const fileName = `${Date.now()}-${
        path.parse(originalName).name
      }.${targetFormat}`;

      const fileUrl = await uploadFileToSupabase(
        convertedFilePath,
        fileName
      );

      // Save DB records
      const transaction = await sequelize.transaction();

      try {
        const fileRecord = await File.create(
          {
            filename: originalName,
            filetype: fileType,
            filesize: fileSize,
            user_id: userId,
            converted_file_url: fileUrl,
          },
          { transaction }
        );

        await ConversionLog.create(
          {
            file_id: fileRecord.id,
            target_format: targetFormat,
            status: "completed",
            converted_file_url: fileUrl,
          },
          { transaction }
        );

        await transaction.commit();
      } catch (err) {
        await transaction.rollback();
        throw err;
      }

      return {
        fileUrl,
        userId,
      };
    } finally {
      if (convertedFilePath) {
        await safeDelete(convertedFilePath);
      }

      if (filePath) {
        await safeDelete(filePath);
      }
    }
  },
  {
    connection,
    concurrency: 5,
  }
);

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.log(`❌ Job ${job?.id} failed:`, err.message || err);
});

export default worker;