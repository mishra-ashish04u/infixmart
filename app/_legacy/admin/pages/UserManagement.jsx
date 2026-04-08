import { useEffect, useRef, useState } from "react";
import { MdSearch, MdExpandMore, MdExpandLess } from "react-icons/md";
import adminAxios from "../utils/adminAxios";
import TableRowSkeleton from "../../components/skeletons/TableRowSkeleton";
import EmptyState from "../../components/EmptyState";

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function initials(name = "") {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

const greyBtn   = { padding: "0.3rem 0.75rem", background: "#F5F5F5", color: "#555",    border: "1px solid #ddd",     borderRadius: 6, cursor: "pointer", fontSize: "0.8rem", fontWeight: 500 };
const greenBtn  = { padding: "0.3rem 0.75rem", background: "transparent", color: "#00A651", border: "1px solid #00A651", borderRadius: 6, cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 };
const redBtn    = { padding: "0.3rem 0.75rem", background: "transparent", color: "#E53935", border: "1px solid #E53935", borderRadius: 6, cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 };
const dangerBtn = { padding: "0.55rem 1rem",   background: "#E53935",   color: "#fff",   border: "none",               borderRadius: 6, cursor: "pointer", fontSize: "0.875rem", fontWeight: 500 };


function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: "flex", gap: "0.35rem", justifyContent: "center", padding: "1rem 0", flexWrap: "wrap" }}>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button key={p} onClick={() => onChange(p)} style={{ width: 32, height: 32, borderRadius: 6, border: "1px solid", borderColor: p === page ? "#1565C0" : "#E0E0E0", background: p === page ? "#1565C0" : "#fff", color: p === page ? "#fff" : "#333", cursor: "pointer", fontWeight: p === page ? 600 : 400, fontSize: "0.875rem" }}>{p}</button>
      ))}
    </div>
  );
}

// ── Expand row: user stats ────────────────────────────────────────────────────
function UserStatsRow({ user }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminAxios.get(`/api/admin/users/${user.id}/stats`)
      .then((r) => setStats(r.data))
      .catch(() => {});
  }, [user.id]);

  const col = (label, val) => (
    <div style={{ minWidth: 130 }}>
      <div style={{ fontSize: "0.73rem", color: "#999", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>{label}</div>
      <div style={{ fontWeight: 600, color: "#1A237E", fontSize: "0.95rem" }}>{val}</div>
    </div>
  );

  return (
    <tr>
      <td colSpan={7} style={{ background: "#F0F4FF", padding: "1rem 1.5rem", borderBottom: "2px solid #E0E0E0" }}>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          {col("Email", user.email)}
          {col("Mobile", user.mobile || "—")}
          {col("Joined", fmtDate(user.createdAt))}
          {col("Last Login", fmtDate(user.last_login_date))}
          {stats ? (
            <>
              {col("Total Orders", stats.orderCount)}
              {col("Total Spent", inr(stats.totalSpent))}
            </>
          ) : (
            col("Orders/Spent", "Loading…")
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Suspend confirm dialog ────────────────────────────────────────────────────
function SuspendDialog({ user, onConfirm, onCancel, loading }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
      <div style={{ background: "#fff", borderRadius: 10, padding: "2rem", width: 380, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
        <h3 style={{ color: "#1A237E", marginBottom: "0.75rem", fontSize: "1.05rem" }}>Suspend User</h3>
        <p style={{ color: "#555", fontSize: "0.9rem", marginBottom: "1.5rem", lineHeight: 1.6 }}>
          Are you sure you want to suspend <strong>{user.name}</strong>?{" "}
          They will no longer be able to log in.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={greyBtn}>Cancel</button>
          <button onClick={onConfirm} disabled={loading} style={{ ...dangerBtn, opacity: loading ? 0.7 : 1 }}>
            {loading ? "Suspending…" : "Suspend"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [suspendTarget, setSuspendTarget] = useState(null);
  const [toggling, setToggling] = useState(null); // userId being toggled
  const debounceRef = useRef(null);

  const loadUsers = async (p = 1, q = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, perPage: 20 });
      if (q) params.set("search", q);
      const res = await adminAxios.get(`/api/admin/users?${params}`);
      setUsers(res.data.users || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalUsers(res.data.totalUsers || 0);
      setPage(p);
      setExpanded(null);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadUsers(1, search); }, [search]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(val), 400);
  };

  const toggleStatus = async (user, isActive) => {
    setToggling(user.id);
    try {
      await adminAxios.put(`/api/admin/users/${user.id}/status`, { isActive });
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: isActive ? "active" : "Suspended" } : u));
    } catch (err) { console.error(err); }
    finally { setToggling(null); setSuspendTarget(null); }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#1A237E", margin: 0 }}>
          Users
          <span style={{ fontWeight: 400, color: "#999", fontSize: "0.875rem", marginLeft: 8 }}>({totalUsers} total)</span>
        </h2>
        <div style={{ position: "relative" }}>
          <MdSearch style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#999", fontSize: "1.1rem" }} />
          <input
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="Search by name or email…"
            style={{ padding: "0.55rem 0.875rem 0.55rem 2rem", border: "1px solid #ddd", borderRadius: 6, fontSize: "0.875rem", outline: "none", width: 240 }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #E0E0E0", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                {["Avatar", "Name", "Email", "Role", "Joined", "Status", "Action"].map((h) => (
                  <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600, color: "#555", borderBottom: "1px solid #E0E0E0", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={7} widths={[30, 130, 160, 60, 80, 70, 80]} />)
                : users.length === 0
                ? <tr><td colSpan={7}><EmptyState title="No users found" subtitle="Try adjusting your search query." /></td></tr>
                : users.flatMap((user, i) => {
                    const isExpanded = expanded === user.id;
                    const isActive = user.status === "active";
                    const isBusy = toggling === user.id;

                    const row = (
                      <tr
                        key={`row-${user.id}`}
                        style={{ background: i % 2 === 0 ? "#fff" : "#F9FAFB", borderBottom: isExpanded ? "none" : "1px solid #F0F0F0", cursor: "pointer" }}
                        onClick={() => setExpanded(isExpanded ? null : user.id)}
                      >
                        {/* Avatar */}
                        <td style={{ padding: "0.65rem 1rem" }}>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#1A237E", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.78rem", fontWeight: 700, flexShrink: 0 }}>
                            {initials(user.name)}
                          </div>
                        </td>

                        {/* Name */}
                        <td style={{ padding: "0.65rem 1rem", fontWeight: 500, color: "#222" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            {user.name}
                            {isExpanded ? <MdExpandLess style={{ color: "#999", fontSize: "1rem" }} /> : <MdExpandMore style={{ color: "#ccc", fontSize: "1rem" }} />}
                          </div>
                        </td>

                        {/* Email */}
                        <td style={{ padding: "0.65rem 1rem", color: "#555" }}>{user.email}</td>

                        {/* Role */}
                        <td style={{ padding: "0.65rem 1rem" }}>
                          <span style={{ padding: "0.18rem 0.6rem", borderRadius: 999, fontSize: "0.73rem", fontWeight: 600, background: user.role === "admin" ? "#E3F2FD" : "#F5F5F5", color: user.role === "admin" ? "#1565C0" : "#666" }}>
                            {user.role === "admin" ? "Admin" : "Customer"}
                          </span>
                        </td>

                        {/* Joined */}
                        <td style={{ padding: "0.65rem 1rem", color: "#666", whiteSpace: "nowrap" }}>{fmtDate(user.createdAt)}</td>

                        {/* Status */}
                        <td style={{ padding: "0.65rem 1rem" }}>
                          <span style={{ padding: "0.18rem 0.6rem", borderRadius: 999, fontSize: "0.73rem", fontWeight: 600, background: isActive ? "#E8F5E9" : "#FFEBEE", color: isActive ? "#00A651" : "#E53935" }}>
                            {isActive ? "Active" : "Suspended"}
                          </span>
                        </td>

                        {/* Action */}
                        <td style={{ padding: "0.65rem 1rem" }} onClick={(e) => e.stopPropagation()}>
                          {user.role === "admin" ? (
                            <span style={{ color: "#bbb", fontSize: "0.78rem" }}>—</span>
                          ) : isActive ? (
                            <button
                              onClick={() => setSuspendTarget(user)}
                              disabled={isBusy}
                              style={{ ...redBtn, opacity: isBusy ? 0.6 : 1 }}
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => toggleStatus(user, true)}
                              disabled={isBusy}
                              style={{ ...greenBtn, opacity: isBusy ? 0.6 : 1 }}
                            >
                              {isBusy ? "…" : "Activate"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );

                    if (isExpanded) {
                      return [row, <UserStatsRow key={`stats-${user.id}`} user={user} />];
                    }
                    return [row];
                  })}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onChange={(p) => loadUsers(p, search)} />
      </div>

      {/* Suspend confirm */}
      {suspendTarget && (
        <SuspendDialog
          user={suspendTarget}
          onConfirm={() => toggleStatus(suspendTarget, false)}
          onCancel={() => setSuspendTarget(null)}
          loading={toggling === suspendTarget.id}
        />
      )}
    </div>
  );
}
