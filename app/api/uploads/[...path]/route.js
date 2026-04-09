import fs from "fs/promises";
import path from "path";
import { fail } from "../../../../lib/server/api/http.js";
import { publicUploadPathToDiskPath } from "../../../../lib/server/files/uploads.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".avif") return "image/avif";
  return "application/octet-stream";
}

async function serveUpload(request, context, includeBody = true) {
  const params = context?.params ? await context.params : {};
  const segments = Array.isArray(params.path) ? params.path : [];
  const publicPath = `/uploads/${segments.join("/")}`;
  const diskPath = publicUploadPathToDiskPath(publicPath);

  if (!diskPath) {
    return fail(404, "File not found");
  }

  try {
    const stat = await fs.stat(diskPath);
    const headers = {
      "content-type": getContentType(diskPath),
      "content-length": String(stat.size),
      "cache-control": "public, max-age=31536000, immutable",
    };

    if (!includeBody) {
      return new Response(null, { status: 200, headers });
    }

    const file = await fs.readFile(diskPath);
    return new Response(file, { status: 200, headers });
  } catch {
    return fail(404, "File not found");
  }
}

export async function GET(request, context) {
  return serveUpload(request, context, true);
}

export async function HEAD(request, context) {
  return serveUpload(request, context, false);
}
