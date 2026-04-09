import { fail, handleRouteError, ok } from "../../../../lib/server/api/http.js";
import { requireAccessUserId } from "../../../../lib/server/auth/session.js";
import {
  createPaymentOrder,
  verifyPayment,
} from "../../../../lib/server/services/payments.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function parseJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

async function dispatchNativeRoute(request, segments) {
  const [first] = segments;
  const userId = requireAccessUserId(request);

  if (request.method === "POST" && first === "create-order") {
    return ok(await createPaymentOrder(userId, await parseJson(request)));
  }

  if (request.method === "POST" && first === "verify") {
    return ok(await verifyPayment(userId, await parseJson(request)));
  }

  return null;
}

async function handle(request, context) {
  const params = context?.params ? await context.params : {};
  const segments = Array.isArray(params.path) ? params.path : [];

  try {
    const nativeResponse = await dispatchNativeRoute(request, segments);
    if (nativeResponse) return nativeResponse;
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
