import path from "path";
import fs from "fs";
import multer from "multer";

const tempDir = path.join(process.cwd(), "src", "temp");

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const allowedTypes = [
  // Audio
  "audio/mpeg",
  "audio/wav",
  "audio/aac",
  "audio/flac",
  "audio/ogg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/x-ms-wma",
  // Video
  "video/mp4",
  "video/x-msvideo",
  "video/x-matroska",
  "video/quicktime",
  "video/x-ms-wmv",
  "video/x-flv",
  "video/webm",
  "video/mpeg",
  // Documents
  "application/pdf",
  "text/plain",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/vnd.oasis.opendocument.presentation",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/mspowerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "application/rtf",
  "text/html",
  "text/markdown",
  "text/x-markdown",
  // Images
  "image/png",
  "image/jpeg",
  "image/webp",
];

const fileFilter = (req, file, cb) => {
  // FIX: removed console.log spam that was logging every file upload attempt
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter,
});

export default upload;