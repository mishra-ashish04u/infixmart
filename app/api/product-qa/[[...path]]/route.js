import { fail, handleRouteError, ok } from "../../../../lib/server/api/http.js";
import { requireAccessUserId } from "../../../../lib/server/auth/session.js";
import { requireAdmin } from "../../../../lib/server/services/admin.js";
import { listProductQA, createQuestion, answerQuestion } from "../../../../lib/server/repositories/product-qa.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function parseJson(req) {
  try { return await req.json(); } catch { return {}; }
}

async function handle(request, context) {
  const params = context?.params ? await context.params : {};
  const segments = Array.isArray(params.path) ? params.path : [];
  const [first] = segments;
  const { searchParams } = new URL(request.url);

  try {
    // GET /api/product-qa?productId=X
    if (request.method === "GET" && !first) {
      const productId = Number(searchParams.get("productId"));
      if (!productId) return fail(400, "productId required");
      return ok(await listProductQA(productId, {
        page: Number(searchParams.get("page") || 1),
        perPage: Number(searchParams.get("perPage") || 10),
      }));
    }

    // POST /api/product-qa — ask a question
    if (request.method === "POST" && !first) {
      const userId = requireAccessUserId(request);
      const body = await parseJson(request);
      const question = String(body.question || "").trim().slice(0, 500);
      const productId = Number(body.productId);
      if (!question || !productId) return fail(400, "productId and question required");
      return ok(await createQuestion(productId, userId, question), 201);
    }

    // PUT /api/product-qa/:id/answer — admin answers
    if (request.method === "PUT" && first && segments[1] === "answer") {
      const userId = requireAccessUserId(request);
      await requireAdmin(userId);
      const body = await parseJson(request);
      const answer = String(body.answer || "").trim().slice(0, 2000);
      if (!answer) return fail(400, "answer required");
      return ok(await answerQuestion(Number(first), userId, answer));
    }

    return fail(404, "Route not found");
  } catch (error) {
    return handleRouteError(error);
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const OPTIONS = handle;
