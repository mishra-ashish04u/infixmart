import { handleRouteError, ok } from "../../../../lib/server/api/http.js";
import { addOption, getOptions, removeOption } from "../../../../lib/server/services/option-lists.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function parseJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

async function handle(request, context) {
  const params = context?.params ? await context.params : {};
  const segments = Array.isArray(params.path) ? params.path : [];

  try {
    const [first] = segments;

    if (request.method === "GET" && segments.length === 0) {
      return ok(await getOptions("weight"));
    }

    if (request.method === "POST" && first === "create") {
      return ok(await addOption("weight", await parseJson(request)), 201);
    }

    if (request.method === "DELETE" && first) {
      return ok(await removeOption("weight", first));
    }

    return ok({ message: "Not found", error: true, success: false }, 404);
  } catch (error) {
    return handleRouteError(error);
  }
}

export const GET = handle;
export const POST = handle;
export const DELETE = handle;
