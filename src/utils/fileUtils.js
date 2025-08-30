import fs from "fs/promises";

/**
 * Safely deletes a file. If file doesn't exist, ignore error.
 */
export async function safeDelete(filePath) {
  try {
    await fs.unlink(filePath);
    console.log(`✅ Deleted: ${filePath}`);
  } catch {
    console.warn(`⚠️ Skip delete (not found or busy): ${filePath}`);
  }
}
