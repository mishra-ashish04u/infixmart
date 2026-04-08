import { callExpressInProcess } from "./internalServer.js";

export async function proxyLegacyRequest(request, targetPath) {
  return callExpressInProcess(request, targetPath);
}
