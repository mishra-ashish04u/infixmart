import { fail, handleRouteError, ok } from "../../../../lib/server/api/http.js";
import { setAuthCookies } from "../../../../lib/server/auth/cookies.js";
import { requireAccessUserId } from "../../../../lib/server/auth/session.js";
import {
  adminLogin,
  getAllOrdersAdmin,
  getAllUsers,
  getDashboardStats,
  getSingleUserStats,
  requireAdmin,
  sendAdminTestEmail,
  updateUserStatus,
} from "../../../../lib/server/services/admin.js";
import {
  addAttributeType,
  addAttributeTypeValue,
  editAttributeType,
  getAttributeTypes,
  getAttributeValues,
  removeAttributeType,
  removeAttributeTypeValue,
} from "../../../../lib/server/services/attributes.js";
import {
  getSettingsAdmin,
  saveSetting,
} from "../../../../lib/server/services/settings.js";
import {
  createHomePageItemRecord,
  deleteHomePageItemRecord,
  getAllSectionsAdmin,
  updateHomePageItemRecord,
  uploadHomePageImage,
} from "../../../../lib/server/services/homepage.js";
import {
  createCouponRecord,
  deleteCouponRecord,
  getAllCouponsAdmin,
  updateCouponRecord,
} from "../../../../lib/server/services/coupons.js";

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
  return userId;
}

async function dispatchNativeRoute(request, segments) {
  const [first, second, third] = segments;

  if (request.method === "POST" && first === "login") {
    const result = await adminLogin(await parseJson(request));
    const response = ok(result.body);
    setAuthCookies(response, result.tokens);
    return response;
  }

  if (request.method === "GET" && first === "stats") {
    await requireAdminRequest(request);
    return ok(await getDashboardStats());
  }

  if (request.method === "GET" && first === "orders") {
    await requireAdminRequest(request);
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || 1);
    const perPage = Number(searchParams.get("perPage") || 10);
    const status = searchParams.get("status") || "";
    return ok(await getAllOrdersAdmin({ page, perPage, status }));
  }

  if (request.method === "GET" && first === "users" && !second) {
    await requireAdminRequest(request);
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || 1);
    const perPage = Number(searchParams.get("perPage") || 20);
    const search = searchParams.get("search") || "";
    return ok(await getAllUsers({ page, perPage, search }));
  }

  if (request.method === "PUT" && first === "users" && second && third === "status") {
    await requireAdminRequest(request);
    const body = await parseJson(request);
    return ok(await updateUserStatus(second, body?.isActive === true));
  }

  if (request.method === "GET" && first === "users" && second && third === "stats") {
    await requireAdminRequest(request);
    return ok(await getSingleUserStats(second));
  }

  if (request.method === "GET" && first === "settings" && !second) {
    await requireAdminRequest(request);
    return ok(await getSettingsAdmin());
  }

  if (request.method === "GET" && first === "test-email" && !second) {
    await requireAdminRequest(request);
    const { searchParams } = new URL(request.url);
    return ok(await sendAdminTestEmail(searchParams.get("to") || ""));
  }

  if (request.method === "PUT" && first === "settings" && !second) {
    await requireAdminRequest(request);
    return ok(await saveSetting(await parseJson(request)));
  }

  if (request.method === "GET" && first === "homepage" && !second) {
    await requireAdminRequest(request);
    return ok(await getAllSectionsAdmin());
  }

  if (request.method === "POST" && first === "homepage" && second === "upload") {
    await requireAdminRequest(request);
    return ok(await uploadHomePageImage(request));
  }

  if (request.method === "POST" && first === "homepage" && !second) {
    await requireAdminRequest(request);
    return ok(await createHomePageItemRecord(await parseJson(request)), 201);
  }

  if (request.method === "PUT" && first === "homepage" && second && !third) {
    await requireAdminRequest(request);
    return ok(await updateHomePageItemRecord(second, await parseJson(request)));
  }

  if (request.method === "DELETE" && first === "homepage" && second && !third) {
    await requireAdminRequest(request);
    return ok(await deleteHomePageItemRecord(second));
  }

  if (request.method === "GET" && first === "coupons" && !second) {
    await requireAdminRequest(request);
    return ok(await getAllCouponsAdmin());
  }

  if (request.method === "POST" && first === "coupons" && !second) {
    await requireAdminRequest(request);
    return await createCouponRecord(await parseJson(request));
  }

  if (request.method === "PUT" && first === "coupons" && second && !third) {
    await requireAdminRequest(request);
    return await updateCouponRecord(second, await parseJson(request));
  }

  if (request.method === "DELETE" && first === "coupons" && second && !third) {
    await requireAdminRequest(request);
    return await deleteCouponRecord(second);
  }

  if (first === "attributes" && request.method === "GET" && !second) {
    await requireAdminRequest(request);
    return ok(await getAttributeTypes());
  }

  if (first === "attributes" && request.method === "POST" && !second) {
    await requireAdminRequest(request);
    return ok(await addAttributeType(await parseJson(request)), 201);
  }

  if (first === "attributes" && request.method === "PUT" && second && !third) {
    await requireAdminRequest(request);
    return ok(await editAttributeType(second, await parseJson(request)));
  }

  if (first === "attributes" && request.method === "DELETE" && second && !third) {
    await requireAdminRequest(request);
    return ok(await removeAttributeType(second));
  }

  if (first === "attributes" && request.method === "GET" && second && third === "values") {
    await requireAdminRequest(request);
    return ok(await getAttributeValues(second));
  }

  if (first === "attributes" && request.method === "POST" && second && third === "values") {
    await requireAdminRequest(request);
    return ok(await addAttributeTypeValue(second, await parseJson(request)), 201);
  }

  if (first === "attributes" && request.method === "DELETE" && second && third === "values") {
    const valueId = segments[3];
    await requireAdminRequest(request);
    return ok(await removeAttributeTypeValue(valueId));
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
