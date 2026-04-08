import { createLegacyProxyHandlers } from "../../_server/bridge/appRouteProxy.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handlers = createLegacyProxyHandlers("/api/returns");

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PUT = handlers.PUT;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
export const OPTIONS = handlers.OPTIONS;
export const HEAD = handlers.HEAD;
