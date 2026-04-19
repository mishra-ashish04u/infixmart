import { ok, fail, handleRouteError } from "../../../lib/server/api/http.js";
import { requireAccessUserId } from "../../../lib/server/auth/session.js";
import { saveSubscription, VAPID_PUBLIC } from "../../../lib/server/push/web-push.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return ok({ publicKey: VAPID_PUBLIC || null });
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!body?.endpoint || !body?.keys?.p256dh || !body?.keys?.auth) {
      return fail(400, "Invalid push subscription payload");
    }
    let userId = null;
    try { userId = requireAccessUserId(request); } catch {}
    await saveSubscription(body, userId);
    return ok({ success: true });
  } catch (err) {
    return handleRouteError(err);
  }
}
