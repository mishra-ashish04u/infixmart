import { fail, handleRouteError, ok } from "../../../../lib/server/api/http.js";
import { requireAccessUserId } from "../../../../lib/server/auth/session.js";
import {
  addToCart,
  clearCart,
  getCartItems,
  removeCartItem,
  updateCartQuantity,
} from "../../../../lib/server/services/cart.js";

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

  if (request.method === "GET" && segments.length === 0) {
    return ok(await getCartItems(userId));
  }

  if (request.method === "POST" && first === "add") {
    return ok(await addToCart(userId, await parseJson(request)), 201);
  }

  if (request.method === "PUT" && first === "update-qty") {
    return ok(await updateCartQuantity(userId, await parseJson(request)));
  }

  if (request.method === "DELETE" && first === "delete") {
    return ok(await removeCartItem(userId, await parseJson(request)));
  }

  if (request.method === "DELETE" && first === "clear") {
    return ok(await clearCart(userId));
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
