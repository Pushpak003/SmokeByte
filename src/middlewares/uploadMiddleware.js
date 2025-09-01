import path from "path";
import fs from "fs";
import multer from "multer";
console.log("Upload Middleware Loaded");

const tempDir = path.join(process.cwd(), "src", "temp"); // 'temp' inside src

// Make sure 'temp' folder exists
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const allowedTypes = [
  // Audio
  "audio/mpeg", // .mp3
  "audio/wav", // .wav
  "audio/aac", // .aac
  "audio/flac", // .flac
  "audio/ogg", // .ogg, .oga
  "audio/mp4", // .m4a
  "audio/x-m4a", // alt mime for .m4a
  "audio/x-ms-wma",
  // Videos
  "video/mp4", // .mp4
  "video/x-msvideo", // .avi
  "video/x-matroska", // .mkv
  "video/quicktime", // .mov
  "video/x-ms-wmv", // .wmv
  "video/x-flv", // .flv
  "video/webm", // .webm
  "video/mpeg",

  // Documents
  "application/pdf",
  "text/plain",
  "application/vnd.oasis.opendocument.text", // .odt
  "application/vnd.oasis.opendocument.spreadsheet", // .ods
  "application/vnd.oasis.opendocument.presentation", // .odp
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-powerpoint", // .ppt
  "application/mspowerpoint", // alt mime for .ppt
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "text/csv", // .csv
  "application/rtf", // .rtf
  "text/html", // .html
  "text/markdown", // .md
  "text/x-markdown", // alt mime for .md

  // Images
  "image/png",
  "image/jpeg",
  "image/webp",
];
const fileFilter = (req, file, cb) => {
  console.log("---- [Filter] File received ----");
  console.log("Mimetype:", file.mimetype);
  console.log("Original name:", file.originalname);
  if (allowedTypes.includes(file.mimetype)) {
    console.log("---- [Filter] File allowed ----");
    cb(null, true);
  } else {
    console.log("---- [Filter] File rejected ----");
    cb(new Error("Unsupported file type"), false);
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
