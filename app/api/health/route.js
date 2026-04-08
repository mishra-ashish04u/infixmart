import { createLegacyStaticHandlers } from "../_server/bridge/appRouteProxy.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handlers = createLegacyStaticHandlers("/api/health");

export const GET = handlers.GET;
