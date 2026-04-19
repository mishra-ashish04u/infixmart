import { ok, fail, handleRouteError } from "../../../lib/server/api/http.js";
import { requireAccessUserId } from "../../../lib/server/auth/session.js";
import { getReferralsByReferrer } from "../../../lib/server/repositories/referrals.js";
import { findUserById } from "../../../lib/server/repositories/users.js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const userId = requireAccessUserId(request);
    const [referrals, userRecord] = await Promise.all([
      getReferralsByReferrer(userId),
      findUserById(userId),
    ]);
    if (!userRecord) return fail(404, "User not found");
    return ok({
      referralCode: userRecord.referralCode,
      walletBalance: userRecord.walletBalance,
      referrals,
      totalEarned: referrals.filter((r) => r.credited).length * 50,
      success: true,
      error: false,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
