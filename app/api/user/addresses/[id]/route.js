import { handleRouteError, ok } from "../../../../../lib/server/api/http.js";
import { requireAccessUserId } from "../../../../../lib/server/auth/session.js";
import {
  deleteMyAddress,
  updateMyAddress,
} from "../../../../../lib/server/services/addresses.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function parseJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export async function PUT(request, context) {
  try {
    const params = context?.params ? await context.params : {};
    const userId = requireAccessUserId(request);
    return ok(await updateMyAddress(userId, params.id, await parseJson(request)));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request, context) {
  try {
    const params = context?.params ? await context.params : {};
    const userId = requireAccessUserId(request);
    return ok(await deleteMyAddress(userId, params.id));
  } catch (error) {
    return handleRouteError(error);
  }
}
