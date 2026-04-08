import { proxyLegacyRequest } from "../../_server/bridge/proxyRequest.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handle(request, context) {
  const params = await context.params;
  const segments = Array.isArray(params.path) ? params.path : [];
  return proxyLegacyRequest(request, `/uploads/${segments.join("/")}`);
}

export const GET = handle;
export const HEAD = handle;
