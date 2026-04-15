import { handleRouteError, ok } from "../../../../lib/server/api/http.js";
import { requireAccessUserId } from "../../../../lib/server/auth/session.js";
import { applyCouponCode } from "../../../../lib/server/services/coupons.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function parseJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

// Try to get the logged-in user's ID without throwing — guests get null.
function tryGetUserId(request) {
  try {
    return requireAccessUserId(request);
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    const userId = tryGetUserId(request);
    return ok(await applyCouponCode(await parseJson(request), userId));
  } catch (error) {
    return handleRouteError(error);
  }
}
