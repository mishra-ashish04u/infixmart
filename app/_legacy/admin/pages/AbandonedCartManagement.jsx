"use client";

import { useEffect, useState, useCallback } from "react";
import { MdEmail, MdWhatsapp, MdClose, MdRefresh, MdShoppingCart, MdAccessTime, MdPersonOff, MdDownload } from "react-icons/md";
import { FaRupeeSign } from "react-icons/fa";
import adminAxios from "../utils/adminAxios";
import toast, { Toaster } from "react-hot-toast";
import EmptyState from "../../components/EmptyState";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function idleLabel(minutes) {
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
}

const IDLE_OPTIONS = [
  { label: "Idle > 1 hour",  value: 60  },
  { label: "Idle > 3 hours", value: 180 },
  { label: "Idle > 6 hours", value: 360 },
  { label: "Idle > 1 day",   value: 1440 },
];

function StatusDot({ cart }) {
  const hasEmail     = cart.emailCount > 0;
  const hasWhatsapp  = cart.whatsappCount > 0;
  if (!hasEmail && !hasWhatsapp) return <span style={{ color: "#9ca3af", fontSize: 12 }}>Not contacted</span>;
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {hasEmail && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "#E3F2FD", color: "#1565C0", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>
          <MdEmail size={11} /> Email ×{cart.emailCount}
        </span>
      )}
      {hasWhatsapp && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 3, background: "#E8F5E9", color: "#2E7D32", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>
          <MdWhatsapp size={11} /> WA ×{cart.whatsappCount}
        </span>
      )}
    </div>
  );
}

function CartRow({ cart, onAction }) {
  const [sending, setSending] = useState(null); // 'email' | 'whatsapp' | 'dismiss'

  const act = async (channel) => {
    setSending(channel);
    try {
      if (channel === "dismiss") {
        await adminAxios.post("/api/abandoned-cart/dismiss", { userId: cart.userId });
        toast.success("Cart dismissed");
        onAction();
      } else {
        const res = await adminAxios.post("/api/abandoned-cart/remind", { userId: cart.userId, channel });
        if (res.data?.success) {
          toast.success(channel === "email" ? "Email sent!" : "WhatsApp sent!");
          onAction();
        } else {
          toast.error(res.data?.error || "Failed to send");
        }
      }
    } catch (e) {
      toast.error(e?.response?.data?.msg || e.message || "Error");
    } finally {
      setSending(null);
    }
  };

  const btnBase = {
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "6px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600,
    border: "none", cursor: "pointer", transition: "opacity 0.15s",
    opacity: sending ? 0.6 : 1,
  };

  return (
    <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
      {/* User */}
      <td style={{ padding: "14px 12px", minWidth: 180 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#111" }}>{cart.userName || "Unknown"}</p>
        <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6b7280" }}>{cart.userEmail}</p>
        {cart.userPhone && <p style={{ margin: "1px 0 0", fontSize: 11, color: "#9ca3af" }}>{cart.userPhone}</p>}
      </td>

      {/* Cart value */}
      <td style={{ padding: "14px 12px", textAlign: "right", whiteSpace: "nowrap" }}>
        <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: "#1565C0" }}>{inr(cart.cartSubtotal)}</p>
        <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9ca3af" }}>{cart.itemCount} item{cart.itemCount !== 1 ? "s" : ""}</p>
      </td>

      {/* Idle time */}
      <td style={{ padding: "14px 12px", textAlign: "center", whiteSpace: "nowrap" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, color: cart.idleMinutes > 1440 ? "#E53935" : cart.idleMinutes > 360 ? "#F59E0B" : "#555" }}>
          <MdAccessTime size={14} />
          {idleLabel(cart.idleMinutes)}
        </span>
      </td>

      {/* Reminder status */}
      <td style={{ padding: "14px 12px" }}>
        <StatusDot cart={cart} />
        {cart.lastEmailSentAt && (
          <p style={{ margin: "4px 0 0", fontSize: 10, color: "#9ca3af" }}>
            Last email: {new Date(cart.lastEmailSentAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
        {cart.lastWhatsappSentAt && (
          <p style={{ margin: "2px 0 0", fontSize: 10, color: "#9ca3af" }}>
            Last WA: {new Date(cart.lastWhatsappSentAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </td>

      {/* Actions */}
      <td style={{ padding: "14px 12px", whiteSpace: "nowrap" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button
            onClick={() => act("email")}
            disabled={!!sending}
            style={{ ...btnBase, background: "#E3F2FD", color: "#1565C0" }}
            title={`Send email to ${cart.userEmail}`}
          >
            <MdEmail size={14} />
            {sending === "email" ? "Sending…" : "Email"}
          </button>

          {cart.userPhone ? (
            <button
              onClick={() => act("whatsapp")}
              disabled={!!sending}
              style={{ ...btnBase, background: "#E8F5E9", color: "#2E7D32" }}
              title={`Send WhatsApp to ${cart.userPhone}`}
            >
              <MdWhatsapp size={14} />
              {sending === "whatsapp" ? "Sending…" : "WhatsApp"}
            </button>
          ) : (
            <span style={{ fontSize: 11, color: "#d1d5db", alignSelf: "center" }}>No phone</span>
          )}

          <button
            onClick={() => act("dismiss")}
            disabled={!!sending}
            style={{ ...btnBase, background: "#FEF2F2", color: "#DC2626" }}
            title="Dismiss this cart (won't show again)"
          >
            <MdClose size={14} />
            {sending === "dismiss" ? "…" : "Dismiss"}
          </button>
        </div>
      </td>
    </tr>
  );
}

const today = new Date().toISOString().slice(0, 10);
const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

export default function AbandonedCartManagement() {
  const [carts, setCarts]         = useState([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [pages, setPages]         = useState(1);
  const [loading, setLoading]     = useState(true);
  const [exporting, setExporting] = useState(false);
  const [minIdle, setMinIdle]     = useState(60);
  const [dateFrom, setDateFrom]   = useState("");
  const [dateTo, setDateTo]       = useState("");
  const perPage = 30;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page, perPage, minIdle });
      if (dateFrom) p.set("dateFrom", dateFrom);
      if (dateTo)   p.set("dateTo",   dateTo);
      const res = await adminAxios.get(`/api/abandoned-cart?${p.toString()}`);
      const d = res.data;
      setCarts(d.carts || []);
      setTotal(d.total || 0);
      setPages(d.pages || 1);
    } catch {
      toast.error("Failed to load abandoned carts");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, minIdle, dateFrom, dateTo]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const p = new URLSearchParams({ minIdle, export: "1" });
      if (dateFrom) p.set("dateFrom", dateFrom);
      if (dateTo)   p.set("dateTo",   dateTo);
      const res = await adminAxios.get(`/api/abandoned-cart?${p.toString()}`, { responseType: "blob" });
      const url  = URL.createObjectURL(new Blob([res.data], { type: "text/csv;charset=utf-8;" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `abandoned-carts-${today}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Excel file downloaded!");
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  // Stats
  const totalValue     = carts.reduce((s, c) => s + c.cartSubtotal, 0);
  const notContacted   = carts.filter((c) => c.emailCount === 0 && c.whatsappCount === 0).length;
  const contacted      = carts.length - notContacted;

  return (
    <div>
      <Toaster position="top-right" />

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Abandoned Carts", value: total, color: "#1565C0", icon: <MdShoppingCart size={20} /> },
          { label: "Total Cart Value", value: inr(totalValue), color: "#00A651", icon: <FaRupeeSign size={16} /> },
          { label: "Not Contacted",   value: notContacted, color: "#E53935", icon: <MdPersonOff size={20} /> },
          { label: "Contacted",       value: contacted,    color: "#F59E0B", icon: <MdEmail size={20} /> },
        ].map((s) => (
          <div key={s.label} style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.color + "15", display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>
              {s.icon}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        {/* Idle filter */}
        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>Show carts:</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {IDLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setMinIdle(opt.value); setPage(1); }}
              style={{
                padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
                background: minIdle === opt.value ? "#1565C0" : "#f3f4f6",
                color: minIdle === opt.value ? "#fff" : "#374151",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: "#e5e7eb", flexShrink: 0 }} />

        {/* Date range */}
        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>Last activity:</label>
        <input
          type="date"
          value={dateFrom}
          max={dateTo || today}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "5px 10px", fontSize: 12, color: "#374151", cursor: "pointer" }}
        />
        <span style={{ fontSize: 12, color: "#9ca3af" }}>to</span>
        <input
          type="date"
          value={dateTo}
          min={dateFrom}
          max={today}
          onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "5px 10px", fontSize: 12, color: "#374151", cursor: "pointer" }}
        />
        {(dateFrom || dateTo) && (
          <button
            onClick={() => { setDateFrom(""); setDateTo(""); setPage(1); }}
            style={{ fontSize: 11, color: "#E53935", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
          >
            Clear
          </button>
        )}

        {/* Right side actions */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button
            onClick={fetchData}
            style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 6, background: "#f3f4f6", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#374151" }}
          >
            <MdRefresh size={15} /> Refresh
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 6, background: "#00A651", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#fff", opacity: exporting ? 0.7 : 1 }}
          >
            <MdDownload size={15} />
            {exporting ? "Exporting…" : "Export Excel"}
          </button>
        </div>
      </div>

      {/* WhatsApp notice */}
      <div style={{ background: "#FFF8E1", border: "1px solid #FFE082", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#92400E" }}>
        <strong>WhatsApp setup:</strong> Set <code>WHATSAPP_API_TOKEN</code> and <code>WHATSAPP_PHONE_NUMBER_ID</code> in your .env file to enable WhatsApp messages (Meta Cloud API).
        Email works automatically via your existing SMTP settings.
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Loading…</div>
        ) : carts.length === 0 ? (
          <div style={{ padding: 40 }}>
            <EmptyState
              icon={<MdShoppingCart />}
              title="No abandoned carts"
              subtitle="All your customers are either ordering or haven't been idle long enough."
            />
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8faff", borderBottom: "2px solid #e8eaed" }}>
                  {["Customer", "Cart Value", "Idle", "Reminder Status", "Actions"].map((h) => (
                    <th key={h} style={{ padding: "12px", textAlign: h === "Cart Value" ? "right" : h === "Idle" ? "center" : "left", fontSize: 12, fontWeight: 700, color: "#1565C0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {carts.map((cart) => (
                  <CartRow key={cart.userId} cart={cart} onAction={fetchData} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 16 }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{
                width: 32, height: 32, borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                background: page === p ? "#1565C0" : "#f3f4f6",
                color: page === p ? "#fff" : "#374151",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
