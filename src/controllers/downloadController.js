import ConversionLog from "../models/conversionLogs.js";
import File from "../models/fileModel.js";
import axios from "axios";
import path from "path";

// GET /download/:fileId
// - Verifies file belongs to the requesting user
// - Fetches from Supabase and streams to client
// - Never exposes the raw Supabase URL to the frontend
export const downloadFileController = async (req, res) => {
  try {
    const fileId = parseInt(req.params.fileId, 10);
    if (isNaN(fileId)) {
      return res.status(400).json({ success: false, message: "Invalid file ID." });
    }

    // Find the conversion log for this file
    const log = await ConversionLog.findOne({
      where: { file_id: fileId },
      include: [{ model: File, as: "File" }],
    });

    if (!log) {
      return res.status(404).json({ success: false, message: "File not found." });
    }

    // Ownership check — user can only download their own files
    if (log.File.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    if (log.status !== "completed" || !log.converted_file_url) {
      return res.status(400).json({ success: false, message: "File is not ready for download." });
    }

    const fileUrl = log.converted_file_url;

    // Validate it's still a Supabase URL (sanity check)
    const supabaseHost = new URL(process.env.SUPABASE_URL).hostname;
    const urlHost = new URL(fileUrl).hostname;
    if (urlHost !== supabaseHost) {
      return res.status(403).json({ success: false, message: "Invalid file source." });
    }

    // Stream file from Supabase to client
    const response = await axios({ method: "GET", url: fileUrl, responseType: "stream" });

    const fileName = path.basename(fileUrl);
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Type", response.headers["content-type"] || "application/octet-stream");

    response.data.pipe(res);
  } catch (err) {
    res.status(500).json({ success: false, message: "Download failed." });
  }
};