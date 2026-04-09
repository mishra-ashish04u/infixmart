import { HttpError, fail, handleRouteError, ok } from "../../../../lib/server/api/http.js";
import { requireAccessUserId } from "../../../../lib/server/auth/session.js";
import { saveUploadedFiles } from "../../../../lib/server/files/uploads.js";
import { requireAdmin } from "../../../../lib/server/services/admin.js";
import {
  createHomeSlideRecord,
  deleteHomeSlideRecord,
  getHomeSlidesPublic,
  updateHomeSlideRecord,
} from "../../../../lib/server/services/home-slides.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function parseJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

async function requireAdminRequest(request) {
  const userId = requireAccessUserId(request);
  await requireAdmin(userId);
}

async function dispatchNativeRoute(request, segments) {
  const [first] = segments;

  if (request.method === "GET" && segments.length === 0) {
    const { searchParams } = new URL(request.url);
    return ok(
      await getHomeSlidesPublic({ type: searchParams.get("type") || "" })
    );
  }

  if (request.method === "POST" && first === "upload-images") {
    await requireAdminRequest(request);
    const formData = await request.formData();
    const images = await saveUploadedFiles(formData, "images");
    if (!images.length) {
      throw new HttpError(400, "No images provided");
    }
    return ok({ success: true, images });
  }

  if (request.method === "POST" && first === "create") {
    await requireAdminRequest(request);
    return ok(await createHomeSlideRecord(await parseJson(request)), 201);
  }

  if (request.method === "PUT" && first && segments.length === 1) {
    await requireAdminRequest(request);
    return ok(await updateHomeSlideRecord(first, await parseJson(request)));
  }

  if (request.method === "DELETE" && first && segments.length === 1) {
    await requireAdminRequest(request);
    return ok(await deleteHomeSlideRecord(first));
  }

  return null;
}

async function handle(request, context) {
  const params = context?.params ? await context.params : {};
  const segments = Array.isArray(params.path) ? params.path : [];

  try {
    const nativeResponse = await dispatchNativeRoute(request, segments);
    if (nativeResponse) {
      return nativeResponse;
    }
    return fail(404, "Route not found");
  } catch (error) {
    return handleRouteError(error);
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;
export const HEAD = handle;
