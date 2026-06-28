import supabase from "../config/supabase.js";
import fs from "fs";
import mime from "mime-types";

export const uploadFileToSupabase = async (localFilePath, fileName) => {
  const contentType = mime.lookup(localFilePath) || "application/octet-stream";
  const safeFileName = fileName.replace(/'/g, "").replace(/\s+/g, "-");

  // Read file as buffer — Supabase JS client doesn't support Node.js streams reliably
  const fileBuffer = fs.readFileSync(localFilePath);

  const { data, error } = await supabase.storage
    .from(process.env.SUPABASE_BUCKET)
    .upload(safeFileName, fileBuffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.error("Upload error:", error);
    throw error;
  }

  const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET}/${encodeURIComponent(safeFileName)}`;
  return publicUrl;
};