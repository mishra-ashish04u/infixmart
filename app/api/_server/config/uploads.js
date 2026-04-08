import fs from "fs";
import path from "path";

const uploadsDir = path.resolve(process.cwd(), "uploads");

function ensureUploadsDir() {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

function getUploadFilename(uploadPath) {
  if (typeof uploadPath !== "string") return null;

  const normalized = uploadPath.replace(/\\/g, "/");
  if (!normalized.startsWith("/uploads/")) return null;

  const relative = normalized.slice("/uploads/".length);
  if (!relative || relative.includes("/")) return null;

  const filename = path.posix.basename(relative);
  if (!filename || filename === "." || filename === ".." || filename !== relative) {
    return null;
  }

  return filename;
}

function deleteUploadByPublicPath(uploadPath) {
  const filename = getUploadFilename(uploadPath);
  if (!filename) return false;

  try {
    fs.unlinkSync(path.join(uploadsDir, filename));
    return true;
  } catch {
    return false;
  }
}

export { deleteUploadByPublicPath, ensureUploadsDir, uploadsDir };
