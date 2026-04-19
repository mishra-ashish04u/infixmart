import { withAuth } from "../../../lib/server/api/middleware.js";
import { ok } from "../../../lib/server/api/http.js";
import { getReferralsByReferrer } from "../../../lib/server/repositories/referrals.js";
import { findUserById } from "../../../lib/server/repositories/users.js";

export const GET = withAuth(async (req, { user }) => {
  const [referrals, userRecord] = await Promise.all([
    getReferralsByReferrer(user.id),
    findUserById(user.id),
  ]);

  return ok({
    referralCode: userRecord.referralCode,
    walletBalance: userRecord.walletBalance,
    referrals,
    totalEarned: referrals.filter((r) => r.credited).length * 50,
    success: true,
    error: false,
  });
});
