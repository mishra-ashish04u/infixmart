import { getInternalServerBaseUrl } from "./internalServer.js";

const BODYLESS_METHODS = new Set(["GET", "HEAD"]);

function copyResponseHeaders(sourceHeaders) {
  const headers = new Headers();

  sourceHeaders.forEach((value, key) => {
    headers.append(key, value);
  });

  if (typeof sourceHeaders.getSetCookie === "function") {
    for (const cookie of sourceHeaders.getSetCookie()) {
      headers.append("set-cookie", cookie);
    }
  }

  return headers;
}

export async function proxyLegacyRequest(request, targetPath) {
  const baseUrl = await getInternalServerBaseUrl();
  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(`${targetPath}${incomingUrl.search}`, baseUrl);

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");

  const init = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (!BODYLESS_METHODS.has(request.method)) {
    init.body = Buffer.from(await request.arrayBuffer());
  }

  const response = await fetch(targetUrl, init);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: copyResponseHeaders(response.headers),
  });
}
