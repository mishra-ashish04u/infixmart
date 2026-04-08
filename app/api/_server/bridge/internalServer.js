import http from "http";
import app, { initializeServer } from "../app.js";

// Use globalThis so the singleton survives Next.js module re-evaluations
// across hot reloads and multiple worker starts in the same process.
const globalState = globalThis.__infixmartInternalServer ||
  (globalThis.__infixmartInternalServer = { promise: null });

export async function getInternalServerBaseUrl() {
  if (!globalState.promise) {
    globalState.promise = (async () => {
      await initializeServer();

      const server = http.createServer(app);

      await new Promise((resolve, reject) => {
        server.once("error", (err) => {
          // EADDRINUSE means another worker already owns this port — reset and retry
          globalState.promise = null;
          reject(err);
        });
        server.listen(0, "127.0.0.1", resolve);
      });

      const address = server.address();
      if (!address || typeof address === "string") {
        globalState.promise = null;
        throw new Error("Failed to determine internal server address");
      }

      return {
        server,
        baseUrl: `http://127.0.0.1:${address.port}`,
      };
    })();
  }

  const { baseUrl } = await globalState.promise;
  return baseUrl;
}
