import { handleRouteError, ok } from "../../../../lib/server/api/http.js";
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

export async function POST(request) {
  try {
    return ok(await applyCouponCode(await parseJson(request)));
  } catch (error) {
    return handleRouteError(error);
  }
}
