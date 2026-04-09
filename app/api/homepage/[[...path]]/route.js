import { fail, handleRouteError, ok } from "../../../../lib/server/api/http.js";
import { getSectionItems } from "../../../../lib/server/services/homepage.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function dispatchNativeRoute(request, segments) {
  const [first] = segments;

  if (request.method === "GET" && first && segments.length === 1) {
    return ok(await getSectionItems(first));
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
