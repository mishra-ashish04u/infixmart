"use client";

import { useEffect, useState } from "react";
import { MdAdd, MdEdit, MdDelete, MdClose, MdLocalOffer } from "react-icons/md";
import adminAxios from "../utils/adminAxios";
import toast, { Toaster } from "react-hot-toast";
import EmptyState from "../../components/EmptyState";
import TableRowSkeleton from "../../components/skeletons/TableRowSkeleton";

const inr = (n) => (n != null ? `₹${Number(n).toLocaleString("en-IN")}` : "—");
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");

const EMPTY_FORM = {
  code: "", description: "", type: "percent", value: "",
  minOrderValue: "", maxDiscount: "", usageLimit: "", isActive: true, expiresAt: "",
  restrictionType: "none", restrictedEmail: "",
};

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ background: "#fff", borderRadius: 10, width: "100%", maxWidth: 480, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.25rem", borderBottom: "1px solid #E0E0E0" }}>
          <h3 style={{ margin: 0, fontWeight: 600, color: "#1A237E", fontSize: "1rem" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#999", fontSize: "1.25rem", lineHeight: 1 }}>
            <MdClose />
          </button>
        </div>
        <div style={{ padding: "1.25rem" }}>{children}</div>
      </div>
    </div>
  );
}

export default function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState("");

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await adminAxios.get("/api/admin/coupons");
      setCoupons(res.data.coupons || []);
    } catch { toast.error("Failed to load coupons"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadCoupons(); }, []);

  const openAdd = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setModal(true);
  };

  const openEdit = (c) => {
    setEditItem(c);
    setForm({
      code: c.code,
      description: c.description || "",
      type: c.type,
      value: c.value,
      minOrderValue: c.minOrderValue ?? "",
      maxDiscount: c.maxDiscount ?? "",
      usageLimit: c.usageLimit ?? "",
      isActive: c.isActive,
      expiresAt: c.expiresAt ? c.expiresAt.split("T")[0] : "",
      restrictionType: c.restrictionType || "none",
      restrictedEmail: c.restrictedEmail || "",
    });
    setFormError("");
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) { setFormError("Coupon code is required"); return; }
    if (!form.value || isNaN(form.value) || Number(form.value) <= 0) { setFormError("Value must be a positive number"); return; }
    if (form.type === "percent" && Number(form.value) > 100) { setFormError("Percent discount cannot exceed 100%"); return; }
    if (form.restrictionType === "email" && !form.restrictedEmail.trim()) { setFormError("Email address is required for email-restricted coupons"); return; }

    setSaving(true);
    setFormError("");
    const payload = {
      code: form.code.toUpperCase().trim(),
      description: form.description || null,
      type: form.type,
      value: Number(form.value),
      minOrderValue: form.minOrderValue !== "" ? Number(form.minOrderValue) : 0,
      maxDiscount: form.maxDiscount !== "" ? Number(form.maxDiscount) : null,
      usageLimit: form.usageLimit !== "" ? Number(form.usageLimit) : null,
      isActive: form.isActive,
      expiresAt: form.expiresAt || null,
      restrictionType: form.restrictionType || "none",
      restrictedEmail: form.restrictionType === "email" ? form.restrictedEmail.trim().toLowerCase() : null,
    };

    try {
      if (editItem) {
        await adminAxios.put(`/api/admin/coupons/${editItem.id}`, payload);
        toast.success("Coupon updated");
      } else {
        await adminAxios.post("/api/admin/coupons", payload);
        toast.success("Coupon created");
      }
      setModal(false);
      loadCoupons();
    } catch (err) {
      setFormError(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminAxios.delete(`/api/admin/coupons/${deleteTarget.id}`);
      toast.success("Coupon deleted");
      setDeleteTarget(null);
      loadCoupons();
    } catch { toast.error("Delete failed"); }
    finally { setDeleting(false); }
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const inp = { width: "100%", padding: "0.6rem 0.875rem", border: "1px solid #ddd", borderRadius: 6, fontSize: "0.875rem", outline: "none", boxSizing: "border-box" };
  const lbl = { display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#555", marginBottom: 5 };
  const row = { marginBottom: "1rem" };

  return (
    <div>
      <Toaster position="top-right" />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600, color: "#1A237E" }}>
          Coupons
          <span style={{ fontWeight: 400, color: "#999", fontSize: "0.875rem", marginLeft: 8 }}>({coupons.length} total)</span>
        </h2>
        <button
          onClick={openAdd}
          style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.55rem 1.1rem", background: "#1565C0", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 500, fontSize: "0.875rem" }}
        >
          <MdAdd style={{ fontSize: "1.1rem" }} /> Add Coupon
        </button>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #E0E0E0", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                {["Code", "Type", "Value", "Min Order", "Max Disc.", "Uses", "Expires", "Restriction", "Status", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600, color: "#555", borderBottom: "1px solid #E0E0E0", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={9} />)
                : coupons.length === 0
                ? (
                  <tr>
                    <td colSpan={10}>
                      <EmptyState icon={<MdLocalOffer style={{ fontSize: 64 }} />} title="No coupons yet" subtitle="Create your first coupon to offer discounts." />
                    </td>
                  </tr>
                )
                : coupons.map((c, i) => (
                  <tr key={c.id} style={{ background: i % 2 === 0 ? "#fff" : "#F9FAFB", borderBottom: "1px solid #F0F0F0" }}>
                    <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#1A237E", letterSpacing: 0.5 }}>{c.code}</td>
                    <td style={{ padding: "0.75rem 1rem", textTransform: "capitalize", color: "#555" }}>{c.type}</td>
                    <td style={{ padding: "0.75rem 1rem", fontWeight: 600, color: "#222" }}>
                      {c.type === "percent" ? `${c.value}%` : inr(c.value)}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "#555" }}>{c.minOrderValue ? inr(c.minOrderValue) : "—"}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#555" }}>{c.maxDiscount ? inr(c.maxDiscount) : "—"}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#555" }}>
                      {c.usageCount ?? 0}{c.usageLimit ? ` / ${c.usageLimit}` : ""}
                    </td>
                    <td style={{ padding: "0.75rem 1rem", color: "#555", whiteSpace: "nowrap" }}>{fmtDate(c.expiresAt)}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      {c.restrictionType === "first_order" && (
                        <span style={{ padding: "0.2rem 0.6rem", borderRadius: 999, fontSize: "0.73rem", fontWeight: 600, background: "#FFF8E1", color: "#F57F17", whiteSpace: "nowrap" }}>
                          First Order
                        </span>
                      )}
                      {c.restrictionType === "email" && (
                        <span title={c.restrictedEmail} style={{ padding: "0.2rem 0.6rem", borderRadius: 999, fontSize: "0.73rem", fontWeight: 600, background: "#EDE7F6", color: "#6A1B9A", whiteSpace: "nowrap", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", display: "inline-block" }}>
                          {c.restrictedEmail || "Email"}
                        </span>
                      )}
                      {(!c.restrictionType || c.restrictionType === "none") && (
                        <span style={{ color: "#aaa", fontSize: "0.75rem" }}>Everyone</span>
                      )}
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span style={{ padding: "0.2rem 0.6rem", borderRadius: 999, fontSize: "0.73rem", fontWeight: 600, background: c.isActive ? "#E8F5E9" : "#F5F5F5", color: c.isActive ? "#00A651" : "#999" }}>
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button onClick={() => openEdit(c)} style={{ background: "#E3F2FD", border: "none", borderRadius: 6, padding: "0.35rem 0.6rem", cursor: "pointer", color: "#1565C0", fontSize: "0.85rem" }}>
                          <MdEdit />
                        </button>
                        <button onClick={() => setDeleteTarget(c)} style={{ background: "#FFEBEE", border: "none", borderRadius: 6, padding: "0.35rem 0.6rem", cursor: "pointer", color: "#E53935", fontSize: "0.85rem" }}>
                          <MdDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <Modal title={editItem ? "Edit Coupon" : "Add Coupon"} onClose={() => setModal(false)}>
          <form onSubmit={handleSave}>
            <div style={row}>
              <label style={lbl}>Code *</label>
              <input style={{ ...inp, textTransform: "uppercase" }} value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="SUMMER20" disabled={!!editItem} />
            </div>
            <div style={row}>
              <label style={lbl}>Description</label>
              <input style={inp} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Optional description" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
              <div>
                <label style={lbl}>Type *</label>
                <select style={inp} value={form.type} onChange={(e) => set("type", e.target.value)}>
                  <option value="percent">Percent (%)</option>
                  <option value="flat">Flat (₹)</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Value * {form.type === "percent" ? "(%)" : "(₹)"}</label>
                <input style={inp} type="number" min="0.01" step="0.01" value={form.value} onChange={(e) => set("value", e.target.value)} placeholder={form.type === "percent" ? "20" : "100"} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
              <div>
                <label style={lbl}>Min Order (₹)</label>
                <input style={inp} type="number" min="0" value={form.minOrderValue} onChange={(e) => set("minOrderValue", e.target.value)} placeholder="0" />
              </div>
              <div>
                <label style={lbl}>Max Discount (₹)</label>
                <input style={inp} type="number" min="0" value={form.maxDiscount} onChange={(e) => set("maxDiscount", e.target.value)} placeholder="Optional cap" />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
              <div>
                <label style={lbl}>Usage Limit</label>
                <input style={inp} type="number" min="1" value={form.usageLimit} onChange={(e) => set("usageLimit", e.target.value)} placeholder="Unlimited" />
              </div>
              <div>
                <label style={lbl}>Expires On</label>
                <input style={inp} type="date" value={form.expiresAt} onChange={(e) => set("expiresAt", e.target.value)} />
              </div>
            </div>
            {/* Restriction */}
            <div style={row}>
              <label style={lbl}>Who Can Use This Coupon</label>
              <select style={inp} value={form.restrictionType} onChange={(e) => set("restrictionType", e.target.value)}>
                <option value="none">Everyone (General)</option>
                <option value="first_order">First-Time Buyers Only</option>
                <option value="email">Specific Email Only</option>
              </select>
            </div>
            {form.restrictionType === "email" && (
              <div style={row}>
                <label style={lbl}>Restricted Email *</label>
                <input
                  style={inp}
                  type="email"
                  value={form.restrictedEmail}
                  onChange={(e) => set("restrictedEmail", e.target.value)}
                  placeholder="customer@gmail.com"
                />
              </div>
            )}
            <div style={{ ...row, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} style={{ width: 16, height: 16, cursor: "pointer" }} />
              <label htmlFor="isActive" style={{ fontSize: "0.875rem", color: "#333", cursor: "pointer" }}>Active</label>
            </div>

            {formError && <p style={{ color: "#E53935", fontSize: "0.8rem", margin: "0 0 0.75rem" }}>{formError}</p>}

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setModal(false)} style={{ padding: "0.55rem 1.1rem", background: "#F5F5F5", color: "#555", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer", fontWeight: 500, fontSize: "0.875rem" }}>
                Cancel
              </button>
              <button type="submit" disabled={saving} style={{ padding: "0.55rem 1.25rem", background: saving ? "#90CAF9" : "#1565C0", color: "#fff", border: "none", borderRadius: 6, cursor: saving ? "not-allowed" : "pointer", fontWeight: 500, fontSize: "0.875rem" }}>
                {saving ? "Saving…" : editItem ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <Modal title="Delete Coupon" onClose={() => setDeleteTarget(null)}>
          <p style={{ color: "#333", marginBottom: "1.25rem" }}>
            Delete coupon <strong>{deleteTarget.code}</strong>? This cannot be undone.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <button onClick={() => setDeleteTarget(null)} style={{ padding: "0.55rem 1.1rem", background: "#F5F5F5", color: "#555", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer", fontWeight: 500, fontSize: "0.875rem" }}>
              Cancel
            </button>
            <button onClick={handleDelete} disabled={deleting} style={{ padding: "0.55rem 1.25rem", background: deleting ? "#EF9A9A" : "#E53935", color: "#fff", border: "none", borderRadius: 6, cursor: deleting ? "not-allowed" : "pointer", fontWeight: 500, fontSize: "0.875rem" }}>
              {deleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
