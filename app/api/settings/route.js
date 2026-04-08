import { createLegacyStaticHandlers } from "../_server/bridge/appRouteProxy.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handlers = createLegacyStaticHandlers("/api/settings");

export const GET = handlers.GET;
