import fs from "fs/promises";
import fsSync from "fs";
import path from "path";

export async function deleteLocalFile(dbPath, baseFolder = "public") {
  if (!dbPath) return;
  try {
    // Remove leading slash
    const cleanPath = dbPath.startsWith("/") ? dbPath.slice(1) : dbPath;
    const fullPath = path.join(process.cwd(), baseFolder, cleanPath);
    if (fsSync.existsSync(fullPath)) {
      await fs.unlink(fullPath);
    }
  } catch (err) {
    console.error("File delete failed:", err.message);
  }
}
