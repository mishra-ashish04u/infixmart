import http from "node:http";
import { getInternalServerBaseUrl } from "./internalServer.js";

const BODYLESS_METHODS = new Set(["GET", "HEAD"]);

// Use node:http directly to bypass Next.js's patched global fetch,
// which adds caching/deduplication that breaks localhost proxy requests.
function nodeHttpFetch(urlString, { method, headers, body } = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const reqHeaders = {};
    if (headers) {
      for (const [k, v] of (headers instanceof Headers ? headers.entries() : Object.entries(headers))) {
        reqHeaders[k] = v;
      }
    }

    const req = http.request(
      { hostname: url.hostname, port: url.port, path: url.pathname + url.search, method: method || "GET", headers: reqHeaders },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const buffer = Buffer.concat(chunks);
          const responseHeaders = new Headers();
          for (const [k, v] of Object.entries(res.headers)) {
            if (Array.isArray(v)) v.forEach((val) => responseHeaders.append(k, val));
            else if (v) responseHeaders.append(k, v);
          }
          resolve(new Response(buffer, { status: res.statusCode, headers: responseHeaders }));
        });
        res.on("error", reject);
      }
    );
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

export async function proxyLegacyRequest(request, targetPath) {
  const baseUrl = await getInternalServerBaseUrl();
  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(`${targetPath}${incomingUrl.search}`, baseUrl);

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");

  const options = {
    method: request.method,
    headers,
  };

  if (!BODYLESS_METHODS.has(request.method)) {
    options.body = Buffer.from(await request.arrayBuffer());
  }

  return nodeHttpFetch(targetUrl.toString(), options);
}
