export const ALLOWED_IMAGE_FORMATS = ["png", "jpeg", "jpg", "webp"];

export const ALLOWED_DOCUMENT_FORMATS = ["pdf", "txt", "odt", "doc", "docx", "html"];

export const ALLOWED_MEDIA_FORMATS = ["mp3", "wav", "mp4", "avi", "mov", "webm"];

export const CONVERSION_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
};

export const JWT_ACCESS_EXPIRY = "15m";
export const JWT_REFRESH_EXPIRY = "7d";
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB