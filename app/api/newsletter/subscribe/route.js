import { execute } from "../../../../lib/server/db/mysql.js";
import { ok, fail, handleRouteError } from "../../../../lib/server/api/http.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function ensureTable() {
  await execute(`
    CREATE TABLE IF NOT EXISTS NewsletterSubscribers (
      id        INT AUTO_INCREMENT PRIMARY KEY,
      email     VARCHAR(255) NOT NULL UNIQUE,
      source    VARCHAR(100) DEFAULT 'exit_popup',
      createdAt DATETIME NOT NULL DEFAULT NOW()
    )
  `);
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body.email || "").trim().toLowerCase();
    if (!email || !/\S+@\S+\.\S+/.test(email)) return fail(400, "Valid email required");

    await ensureTable();
    await execute(
      `INSERT IGNORE INTO NewsletterSubscribers (email, source) VALUES (:email, :source)`,
      { email, source: body.source || "exit_popup" }
    );
    return ok({ message: "Subscribed successfully" });
  } catch (error) {
    return handleRouteError(error);
  }
}
