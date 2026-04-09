import { handleRouteError, ok } from "../../../lib/server/api/http.js";
import { getSettingsPublic } from "../../../lib/server/services/settings.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return ok(await getSettingsPublic());
  } catch (error) {
    return handleRouteError(error);
  }
}
