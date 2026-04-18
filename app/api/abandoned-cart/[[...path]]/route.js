import { fail, handleRouteError, ok } from "../../../../lib/server/api/http.js";
import { requireAccessUserId } from "../../../../lib/server/auth/session.js";
import { requireAdmin } from "../../../../lib/server/services/admin.js";
import {
  getAbandonedCarts,
  sendAbandonedCartReminder,
  dismissAbandonedCart,
} from "../../../../lib/server/services/abandoned-cart.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function parseJson(request) {
  try { return await request.json(); } catch { return {}; }
}

async function requireAdminRequest(request) {
  const userId = requireAccessUserId(request);
  await requireAdmin(userId);
  return userId;
}

async function dispatch(request, segments) {
  const [first] = segments;

  // GET /api/abandoned-cart — list abandoned carts
  if (request.method === "GET" && segments.length === 0) {
    await requireAdminRequest(request);
    const { searchParams } = new URL(request.url);
    const exportAll = searchParams.get("export") === "1";
    const data = await getAbandonedCarts({
      page:           Number(searchParams.get("page")     || 1),
      perPage:        Number(searchParams.get("perPage")  || 30),
      minIdleMinutes: Number(searchParams.get("minIdle")  || 60),
      dateFrom:       searchParams.get("dateFrom") || null,
      dateTo:         searchParams.get("dateTo")   || null,
      exportAll,
    });

    // CSV export
    if (exportAll) {
      const rows = data.carts;
      const headers = ["Name", "Email", "Phone", "Items", "Cart Value (INR)", "Last Activity", "Idle (hours)", "Emails Sent", "WhatsApp Sent", "Last Email", "Last WhatsApp"];
      const csvRows = rows.map((r) => [
        r.userName || "",
        r.userEmail || "",
        r.userPhone || "",
        r.itemCount,
        r.cartSubtotal,
        r.lastCartActivity ? new Date(r.lastCartActivity).toLocaleString("en-IN") : "",
        r.idleMinutes ? (r.idleMinutes / 60).toFixed(1) : "",
        r.emailCount,
        r.whatsappCount,
        r.lastEmailSentAt    ? new Date(r.lastEmailSentAt).toLocaleString("en-IN")    : "",
        r.lastWhatsappSentAt ? new Date(r.lastWhatsappSentAt).toLocaleString("en-IN") : "",
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","));

      const csv = [headers.join(","), ...csvRows].join("\r\n");
      return new Response("\uFEFF" + csv, {   // BOM for Excel UTF-8
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="abandoned-carts-${new Date().toISOString().slice(0,10)}.csv"`,
        },
      });
    }

    return ok(data);
  }

  // POST /api/abandoned-cart/remind — send email or whatsapp reminder
  if (request.method === "POST" && first === "remind") {
    await requireAdminRequest(request);
    const body = await parseJson(request);
    const result = await sendAbandonedCartReminder(Number(body.userId), body.channel);
    return ok(result);
  }

  // POST /api/abandoned-cart/dismiss — mark as dismissed
  if (request.method === "POST" && first === "dismiss") {
    await requireAdminRequest(request);
    const body = await parseJson(request);
    return ok(await dismissAbandonedCart(Number(body.userId)));
  }

  return null;
}

async function handle(request, context) {
  const params = context?.params ? await context.params : {};
  const segments = Array.isArray(params.path) ? params.path : [];
  try {
    const res = await dispatch(request, segments);
    if (res) return res;
    return fail(404, "Route not found");
  } catch (err) {
    return handleRouteError(err);
  }
}

export const GET    = handle;
export const POST   = handle;
export const PUT    = handle;
export const DELETE = handle;
export const OPTIONS = handle;
export const HEAD   = handle;
