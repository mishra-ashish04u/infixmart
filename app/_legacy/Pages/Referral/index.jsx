"use client";
import React, { useEffect, useState } from "react";
import { getData } from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

const REFERRAL_REWARD = 50;

const Referral = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getData("/api/referral")
      .then((res) => { if (res && !res.error) setData(res); })
      .finally(() => setLoading(false));
  }, []);

  const referralLink = data?.referralCode
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${data.referralCode}`
    : "";

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!user) {
    return (
      <section className="py-20 text-center bg-[#F5F7FF] min-h-screen">
        <p className="text-gray-500 text-[15px]">Please log in to view your referral dashboard.</p>
      </section>
    );
  }

  return (
    <section className="py-10 bg-[#F5F7FF] min-h-screen">
      <div className="container max-w-2xl mx-auto">
        <h1 className="text-[24px] font-[800] text-gray-900 mb-2">Refer & Earn</h1>
        <p className="text-[14px] text-gray-500 mb-8">
          Share your referral link. Both you and your friend get{" "}
          <span className="font-[700] text-[#1565C0]">₹{REFERRAL_REWARD} wallet credit</span> when they
          place their first order.
        </p>

        {/* Wallet balance */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 shadow-sm">
          <p className="text-[12px] font-[700] uppercase tracking-widest text-gray-400 mb-1">Wallet Balance</p>
          <p className="text-[36px] font-[900] text-[#1565C0] leading-none">
            ₹{loading ? "—" : Number(data?.walletBalance || 0).toLocaleString("en-IN")}
          </p>
          <p className="text-[12px] text-gray-400 mt-1">Automatically applied at checkout</p>
        </div>

        {/* Referral link */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 shadow-sm">
          <p className="text-[13px] font-[700] text-gray-700 mb-3">Your Referral Link</p>
          <div className="flex gap-2">
            <input
              readOnly
              value={loading ? "Loading…" : referralLink}
              className="flex-1 bg-[#F5F7FF] border border-gray-200 rounded-xl px-4 py-2.5 text-[13px] text-gray-700 focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-5 py-2.5 bg-[#1565C0] text-white text-[13px] font-[700] rounded-xl hover:bg-[#1251A3] transition-colors whitespace-nowrap"
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
          {data?.referralCode && (
            <p className="text-[12px] text-gray-400 mt-2">
              Code: <span className="font-[700] text-gray-600">{data.referralCode}</span>
            </p>
          )}
        </div>

        {/* How it works */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 shadow-sm">
          <p className="text-[13px] font-[700] text-gray-700 mb-4">How it works</p>
          <div className="flex flex-col gap-3">
            {[
              { step: "1", text: "Share your referral link with friends" },
              { step: "2", text: "Friend registers using your link" },
              { step: "3", text: "Friend places their first order" },
              { step: "4", text: `Both of you get ₹${REFERRAL_REWARD} wallet credit instantly` },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-[#EEF4FF] text-[#1565C0] text-[12px] font-[800] flex items-center justify-center flex-shrink-0">
                  {step}
                </span>
                <span className="text-[13px] text-gray-600">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Referral history */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <p className="text-[13px] font-[700] text-gray-700 mb-4">
            Referral History
            {!loading && data?.referrals?.length > 0 && (
              <span className="ml-2 text-[11px] font-[600] text-[#1565C0]">
                ({data.referrals.filter((r) => r.credited).length} credited, ₹{data.totalEarned || 0} earned)
              </span>
            )}
          </p>
          {loading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : !data?.referrals?.length ? (
            <p className="text-[13px] text-gray-400 text-center py-4">No referrals yet. Start sharing!</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {data.referrals.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-[13px] font-[600] text-gray-700">{r.refereeName}</p>
                    <p className="text-[11px] text-gray-400">{r.refereeEmail}</p>
                  </div>
                  <span
                    className={`text-[11px] font-[700] px-2.5 py-1 rounded-full ${
                      r.credited
                        ? "bg-[#E8F5E9] text-[#2E7D32]"
                        : "bg-[#FFF3E0] text-[#E65100]"
                    }`}
                  >
                    {r.credited ? `+₹${REFERRAL_REWARD} Credited` : "Pending first order"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Referral;
