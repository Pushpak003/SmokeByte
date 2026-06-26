import fs from "fs";

// Magic bytes = first few bytes of a file that identify its true type.
// A user can rename malware.exe to image.png — mimetype check won't catch it.
// Magic bytes always tell the truth.
const MAGIC_BYTES = {
  // Images
  png:  { bytes: [0x89, 0x50, 0x4e, 0x47], offset: 0 },
  jpg:  { bytes: [0xff, 0xd8, 0xff],        offset: 0 },
  jpeg: { bytes: [0xff, 0xd8, 0xff],        offset: 0 },
  webp: { bytes: [0x52, 0x49, 0x46, 0x46],  offset: 0 }, // "RIFF"
  // PDF
  pdf:  { bytes: [0x25, 0x50, 0x44, 0x46],  offset: 0 }, // "%PDF"
  // ZIP-based formats (docx, xlsx, pptx, odt etc — all zip internally)
  zip:  { bytes: [0x50, 0x4b, 0x03, 0x04],  offset: 0 }, // "PK\x03\x04"
  // MP3
  mp3:  { bytes: [0x49, 0x44, 0x33],        offset: 0 }, // "ID3"
  // MP4 — ftyp box at offset 4
  mp4:  { bytes: [0x66, 0x74, 0x79, 0x70],  offset: 4 }, // "ftyp"
};

// Mimetypes that are ZIP-based (Office Open XML, ODF)
const ZIP_BASED_MIMETYPES = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/vnd.oasis.opendocument.presentation",
];

// Text-based formats — can't verify by magic bytes, skip check
const TEXT_MIMETYPES = [
  "text/plain",
  "text/csv",
  "text/html",
  "text/markdown",
  "text/x-markdown",
  "application/rtf",
];

function readBytes(filePath, length, offset = 0) {
  const buffer = Buffer.alloc(length);
  const fd = fs.openSync(filePath, "r");
  fs.readSync(fd, buffer, 0, length, offset);
  fs.closeSync(fd);
  return buffer;
}

function matchesMagic(filePath, magic) {
  try {
    const buf = readBytes(filePath, magic.bytes.length, magic.offset);
    return magic.bytes.every((byte, i) => buf[i] === byte);
  } catch {
    return false;
  }
}

export const validateMagicBytes = (req, res, next) => {
  const file = req.file;
  if (!file) return next();

  const mime = file.mimetype;

  // Text formats — no magic bytes, skip
  if (TEXT_MIMETYPES.includes(mime)) return next();

  // ZIP-based Office/ODF formats
  if (ZIP_BASED_MIMETYPES.includes(mime)) {
    if (!matchesMagic(file.path, MAGIC_BYTES.zip)) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ success: false, message: "File content does not match its type." });
    }
    return next();
  }

  // Images
  if (mime === "image/png" && !matchesMagic(file.path, MAGIC_BYTES.png)) {
    fs.unlinkSync(file.path);
    return res.status(400).json({ success: false, message: "File is not a valid PNG." });
  }
  if ((mime === "image/jpeg" || mime === "image/jpg") && !matchesMagic(file.path, MAGIC_BYTES.jpg)) {
    fs.unlinkSync(file.path);
    return res.status(400).json({ success: false, message: "File is not a valid JPEG." });
  }
  if (mime === "image/webp" && !matchesMagic(file.path, MAGIC_BYTES.webp)) {
    fs.unlinkSync(file.path);
    return res.status(400).json({ success: false, message: "File is not a valid WebP." });
  }

  // PDF
  if (mime === "application/pdf" && !matchesMagic(file.path, MAGIC_BYTES.pdf)) {
    fs.unlinkSync(file.path);
    return res.status(400).json({ success: false, message: "File is not a valid PDF." });
  }

  // Video/Audio — basic check
  if (mime === "video/mp4" && !matchesMagic(file.path, MAGIC_BYTES.mp4)) {
    fs.unlinkSync(file.path);
    return res.status(400).json({ success: false, message: "File is not a valid MP4." });
  }

  next();
};