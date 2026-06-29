import supabase from "../config/supabase.js";
import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import https from "https";
import http from "http";
import mime from "mime-types";
import os from "os";

// ── Upload converted/original file to Supabase ───────────────────────────────
export const uploadFileToSupabase = async (localFilePath, fileName) => {
  const contentType  = mime.lookup(localFilePath) || "application/octet-stream";
  const safeFileName = fileName.replace(/'/g, "").replace(/\s+/g, "-");

  const fileBuffer = fs.readFileSync(localFilePath);

  const { error } = await supabase.storage
    .from(process.env.SUPABASE_BUCKET)
    .upload(safeFileName, fileBuffer, { contentType, upsert: true });

  if (error) {
    console.error("Upload error:", error);
    throw error;
  }

  return `${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET}/${encodeURIComponent(safeFileName)}`;
};

// ── Download original file from Supabase to a local temp path ────────────────
// Worker uses this instead of localPath — makes worker container-independent.
export const downloadFromSupabase = (fileUrl, originalName) => {
  return new Promise((resolve, reject) => {
    const ext      = path.extname(originalName) || "";
    const tmpPath  = path.join(os.tmpdir(), `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
    const fileStream = fs.createWriteStream(tmpPath);

    const protocol = fileUrl.startsWith("https") ? https : http;

    protocol.get(fileUrl, (res) => {
      if (res.statusCode !== 200) {
        fileStream.close();
        return reject(new Error(`Failed to download original file — HTTP ${res.statusCode}`));
      }
      res.pipe(fileStream);
      fileStream.on("finish", () => {
        fileStream.close();
        resolve(tmpPath);
      });
    }).on("error", (err) => {
      fileStream.close();
      fsPromises.unlink(tmpPath).catch(() => {});
      reject(err);
    });
  });
};