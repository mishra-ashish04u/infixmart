import http from "http";
import app, { initializeServer } from "../app.js";

let serverStatePromise;

export async function getInternalServerBaseUrl() {
  if (!serverStatePromise) {
    serverStatePromise = (async () => {
      await initializeServer();

      const server = http.createServer(app);

      await new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", resolve);
      });

      const address = server.address();
      if (!address || typeof address === "string") {
        throw new Error("Failed to determine internal server address");
      }

      return {
        server,
        baseUrl: `http://127.0.0.1:${address.port}`,
      };
    })();
  }

  const { baseUrl } = await serverStatePromise;
  return baseUrl;
}
