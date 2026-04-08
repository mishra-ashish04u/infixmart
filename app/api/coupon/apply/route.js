import { createLegacyStaticHandlers } from "../../_server/bridge/appRouteProxy.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handlers = createLegacyStaticHandlers("/api/coupon/apply");

export const POST = handlers.POST;
