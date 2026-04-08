import { proxyLegacyRequest } from "./proxyRequest.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function createLegacyProxyHandlers(basePath) {
  async function handle(request, context) {
    const params = context?.params ? await context.params : {};
    const segments = Array.isArray(params.path) ? params.path : [];
    const suffix = segments.length ? `/${segments.join("/")}` : "";
    return proxyLegacyRequest(request, `${basePath}${suffix}`);
  }

  return {
    GET: handle,
    POST: handle,
    PUT: handle,
    PATCH: handle,
    DELETE: handle,
    OPTIONS: handle,
    HEAD: handle,
  };
}

export function createLegacyStaticHandlers(targetPath) {
  async function handle(request) {
    return proxyLegacyRequest(request, targetPath);
  }

  return {
    GET: handle,
    POST: handle,
    PUT: handle,
    PATCH: handle,
    DELETE: handle,
    OPTIONS: handle,
    HEAD: handle,
  };
}
