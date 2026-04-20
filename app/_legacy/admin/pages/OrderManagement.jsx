"use client";

import { useEffect, useRef, useState } from "react";
import { MdSearch, MdExpandMore, MdExpandLess, MdLocalShipping, MdCheckCircle, MdInventory, MdCancel, MdShoppingBag, MdFileDownload } from "react-icons/md";
import { FaCheck } from "react-icons/fa";
import adminAxios from "../utils/adminAxios";
import toast, { Toaster } from "react-hot-toast";
import TableRowSkeleton from "../../components/skeletons/TableRowSkeleton";
import EmptyState from "../../components/EmptyState";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const STATUS_LIST = ["all", "pending", "processing", "shipped", "delivered"];
const VALID_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

const STATUS_CFG = {
  pending:    { bg: "bg-gray-100",   text: "text-gray-600"  },
  processing: { bg: "bg-blue-100",   text: "text-blue-700"  },
  shipped:    { bg: "bg-amber-100",  text: "text-amber-700" },
  delivered:  { bg: "bg-green-100",  text: "text-green-700" },
  cancelled:  { bg: "bg-red-100",    text: "text-red-700"   },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-[700] capitalize ${cfg.bg} ${cfg.text}`}>
      {status}
    </span>
  );
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex gap-1.5 justify-center py-4 flex-wrap px-4">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-8 h-8 rounded-lg text-[13px] font-[500] border transition-colors ${
            p === page
              ? "bg-[#1565C0] text-white border-[#1565C0]"
              : "bg-white text-gray-700 border-gray-200 hover:border-[#1565C0]"
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

const TIMELINE_STEPS = [
  { key: "pending",    label: "Ordered",    Icon: MdInventory },
  { key: "processing", label: "Processing", Icon: MdInventory },
  { key: "shipped",    label: "Shipped",    Icon: MdLocalShipping },
  { key: "delivered",  label: "Delivered",  Icon: MdCheckCircle },
];
const stepIndex = { pending: 0, processing: 1, shipped: 2, delivered: 3 };

function AdminOrderTimeline({ status }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-xl mb-4">
        <MdCancel className="text-red-700 text-[18px] flex-shrink-0" />
        <span className="text-[13px] font-[600] text-red-700">Order Cancelled</span>
      </div>
    );
  }

  const current = stepIndex[status] ?? 0;
  const pct = (current / (TIMELINE_STEPS.length - 1)) * 100;

  return (
    <div className="bg-blue-50 rounded-xl p-3.5 mb-4 border border-blue-100">
      <p className="text-[10px] font-[700] text-[#1565C0] uppercase tracking-wider mb-3">Order Progress</p>
      <div className="relative flex justify-between items-start">
        <div className="absolute top-4 left-[12.5%] right-[12.5%] h-0.5 bg-gray-200" />
        <div className="absolute top-4 left-[12.5%] h-0.5 bg-[#1565C0] transition-all duration-500" style={{ width: `${pct * 0.75}%` }} />
        {TIMELINE_STEPS.map(({ key, label, Icon }, idx) => {
          const done = idx < current;
          const active = idx === current;
          return (
            <div key={key} className="flex-1 flex flex-col items-center relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${done || active ? "border-[#1565C0]" : "border-gray-300"} ${done ? "bg-[#1565C0]" : "bg-white"}`}>
                {done ? <FaCheck className="text-white text-[11px]" /> : <Icon className={`text-[15px] ${active ? "text-[#1565C0]" : "text-gray-300"}`} />}
              </div>
              <span className={`text-[10px] font-[600] mt-1 text-center ${done || active ? "text-[#1565C0]" : "text-gray-400"}`}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderDetail({ order, onStatusUpdated }) {
  const [newStatus, setNewStatus] = useState(order.status);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [courierName, setCourierName] = useState(order.courierName || "");
  const [updating, setUpdating] = useState(false);
  const addr = order.shippingAddress || {};
  let items = [];
  try { items = Array.isArray(order.items) ? order.items : JSON.parse(order.items || "[]"); } catch {}

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await adminAxios.put(`/api/order/${order.id}/status`, {
        status: newStatus,
        trackingNumber: trackingNumber || null,
        courierName: courierName || null,
      });
      toast.success(`Status updated to "${newStatus}"`);
      onStatusUpdated(order.id, newStatus);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <tr>
      <td colSpan={8} className="p-0 bg-[#F9FAFB] border-b-2 border-gray-200">
        <div className="p-4 sm:p-5">
          <AdminOrderTimeline status={order.status} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Address */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-[10px] font-[700] uppercase tracking-wider text-[#1A237E] mb-2">Shipping Address</p>
              <p className="text-[13px] text-gray-600 leading-relaxed">
                {addr.fullName || addr.name}<br />
                {addr.phone || addr.mobile}<br />
                {addr.addressLine || addr.flatHouse}<br />
                {addr.city || addr.townCity}{addr.pincode ? `, ${addr.pincode}` : ""}
              </p>
            </div>

            {/* Items */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-[10px] font-[700] uppercase tracking-wider text-[#1A237E] mb-2">Items ({items.length})</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 bg-gray-50 rounded-lg p-2 border border-gray-100">
                    {item.image && <img src={item.image} alt={item.name} className="w-9 h-9 object-cover rounded flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-[500] text-gray-800 truncate">{item.name}</div>
                      <div className="text-[11px] text-gray-500">Qty: {item.qty || item.quantity || 1} × {inr(item.price)}</div>
                    </div>
                    <div className="text-[12px] font-[600] text-[#1A237E] whitespace-nowrap">{inr((item.price || 0) * (item.qty || item.quantity || 1))}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status update */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-[10px] font-[700] uppercase tracking-wider text-[#1A237E] mb-2">Update Status</p>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#1565C0] bg-white mb-2"
              >
                {VALID_STATUSES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              {(newStatus === "shipped" || order.status === "shipped") && (
                <div className="space-y-2 mb-2">
                  <input type="text" placeholder="Tracking number" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[12px] outline-none focus:border-[#1565C0]" />
                  <input type="text" placeholder="Courier (e.g. Delhivery)" value={courierName} onChange={(e) => setCourierName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[12px] outline-none focus:border-[#1565C0]" />
                </div>
              )}
              <button onClick={handleUpdate} disabled={updating}
                className="w-full py-2.5 bg-[#1565C0] text-white text-[13px] font-[600] rounded-lg hover:bg-[#1251A3] disabled:opacity-60 transition-colors">
                {updating ? "Updating…" : "Update"}
              </button>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const [exportFrom, setExportFrom] = useState("");
  const [exportTo, setExportTo] = useState("");
  const [exporting, setExporting] = useState(false);
  const debounceRef = useRef(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (exportFrom) params.set("from", exportFrom);
      if (exportTo) params.set("to", exportTo);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await adminAxios.get(`/api/admin/export/orders?${params}`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
      const a = document.createElement("a");
      a.href = url; a.download = `orders-${Date.now()}.csv`; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error("Export failed"); }
    finally { setExporting(false); }
  };

  const loadOrders = async (p = 1, status = "all", q = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, perPage: 10 });
      if (status !== "all") params.set("status", status);
      const res = await adminAxios.get(`/api/admin/orders?${params}`);
      let data = res.data.orders || [];
      if (q) {
        const lq = q.toLowerCase();
        data = data.filter((o) => String(o.id).includes(q) || o.user?.name?.toLowerCase().includes(lq) || o.user?.email?.toLowerCase().includes(lq));
      }
      setOrders(data);
      setTotalPages(res.data.totalPages || 1);
      setTotalOrders(res.data.totalOrders || 0);
      setPage(p);
      setExpanded(null);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadOrders(1, statusFilter, search); }, [statusFilter, search]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(val), 400);
  };

  const handleStatusUpdated = (orderId, newStatus) => {
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  return (
    <div className="space-y-4">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-[16px] font-[700] text-[#1A237E]">
          Orders <span className="font-[400] text-gray-400 text-[13px]">({totalOrders} total)</span>
        </h2>
        {/* Export controls */}
        <div className="flex flex-wrap gap-2 items-center">
          <input type="date" value={exportFrom} onChange={(e) => setExportFrom(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-[12px] outline-none focus:border-[#1565C0]" />
          <span className="text-gray-400 text-[12px]">–</span>
          <input type="date" value={exportTo} onChange={(e) => setExportTo(e.target.value)}
            className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-[12px] outline-none focus:border-[#1565C0]" />
          <button onClick={handleExport} disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00A651] text-white text-[12px] font-[600] rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors">
            <MdFileDownload className="text-[15px]" /> {exporting ? "…" : "Export CSV"}
          </button>
        </div>
      </div>

      {/* Search + Status tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 border-b border-gray-100">
          <div className="relative flex-1 max-w-xs">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]" />
            <input
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search by ID or customer…"
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-[13px] outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/10"
            />
          </div>
          <div className="flex gap-0 overflow-x-auto border-b-0">
            {STATUS_LIST.map((s) => (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-1.5 text-[12px] font-[600] rounded-lg whitespace-nowrap transition-colors capitalize ${
                  statusFilter === s ? "bg-[#1565C0] text-white" : "text-gray-500 hover:text-[#1565C0] hover:bg-blue-50"
                }`}>
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[#F8FAFF]">
                {["Order ID", "Customer", "Date", "Items", "Total", "Payment", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-[700] uppercase tracking-wider text-gray-400 whitespace-nowrap border-b border-gray-100">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={8} widths={[60, 120, 90, 50, 80, 70, 90, 60]} />)
                : orders.length === 0
                ? <tr><td colSpan={8}><EmptyState icon={<MdShoppingBag style={{ fontSize: 64 }} />} title="No orders yet" subtitle="Orders will appear here once customers start purchasing." /></td></tr>
                : orders.flatMap((order) => {
                    let items = [];
                    try { items = Array.isArray(order.items) ? order.items : JSON.parse(order.items || "[]"); } catch {}
                    const isExpanded = expanded === order.id;
                    const mainRow = (
                      <tr key={`row-${order.id}`} className={`border-b border-gray-50 hover:bg-[#F8FAFF] transition-colors ${isExpanded ? "bg-blue-50/30" : ""}`}>
                        <td className="px-4 py-3 font-[700] text-[#1565C0]">#{order.id}</td>
                        <td className="px-4 py-3">
                          <div className="font-[500] text-gray-800">{order.user?.name || "—"}</div>
                          <div className="text-[11px] text-gray-400">{order.user?.email || ""}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{fmtDate(order.createdAt)}</td>
                        <td className="px-4 py-3 text-gray-600">{items.length}</td>
                        <td className="px-4 py-3 font-[700] text-gray-800">{inr(order.totalPrice)}</td>
                        <td className="px-4 py-3">
                          {order.isPaid
                            ? <span className="px-2 py-0.5 rounded-full text-[11px] font-[600] bg-green-100 text-green-700">Paid</span>
                            : <span className="px-2 py-0.5 rounded-full text-[11px] font-[600] bg-gray-100 text-gray-600">{order.paymentMethod || "COD"}</span>
                          }
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                        <td className="px-4 py-3">
                          <button onClick={() => setExpanded(isExpanded ? null : order.id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 rounded-lg text-[12px] font-[500] text-[#1565C0] hover:bg-blue-100 transition-colors">
                            {isExpanded ? <MdExpandLess /> : <MdExpandMore />} View
                          </button>
                        </td>
                      </tr>
                    );
                    if (isExpanded) return [mainRow, <OrderDetail key={`detail-${order.id}`} order={order} onStatusUpdated={handleStatusUpdated} />];
                    return [mainRow];
                  })}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="md:hidden divide-y divide-gray-50">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-36 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
                </div>
              ))
            : orders.length === 0
            ? <div className="py-12 text-center text-gray-400 text-[13px]">No orders found.</div>
            : orders.map((order) => {
                let items = [];
                try { items = Array.isArray(order.items) ? order.items : JSON.parse(order.items || "[]"); } catch {}
                const isExpanded = expanded === order.id;
                return (
                  <div key={order.id}>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-[13px] font-[700] text-[#1565C0]">#{order.id}</span>
                          <span className="ml-2 text-[12px] text-gray-400">{fmtDate(order.createdAt)}</span>
                        </div>
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="text-[13px] font-[500] text-gray-800">{order.user?.name || "—"}</div>
                      <div className="text-[11px] text-gray-400 mb-2">{order.user?.email}</div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[14px] font-[800] text-gray-800">{inr(order.totalPrice)}</span>
                          <span className="ml-2 text-[11px] text-gray-400">{items.length} item{items.length !== 1 ? "s" : ""}</span>
                        </div>
                        <button onClick={() => setExpanded(isExpanded ? null : order.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 rounded-lg text-[12px] font-[600] text-[#1565C0]">
                          {isExpanded ? <MdExpandLess /> : <MdExpandMore />} Details
                        </button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-4">
                        <AdminOrderTimeline status={order.status} />
                        <div className="space-y-3">
                          {/* Address */}
                          <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-3">
                            <p className="text-[10px] font-[700] uppercase tracking-wider text-[#1A237E] mb-1.5">Shipping Address</p>
                            <p className="text-[12px] text-gray-600 leading-relaxed">
                              {(order.shippingAddress?.fullName || order.shippingAddress?.name)}<br />
                              {(order.shippingAddress?.phone || order.shippingAddress?.mobile)}<br />
                              {(order.shippingAddress?.addressLine || order.shippingAddress?.flatHouse)}<br />
                              {(order.shippingAddress?.city || order.shippingAddress?.townCity)}{order.shippingAddress?.pincode ? `, ${order.shippingAddress.pincode}` : ""}
                            </p>
                          </div>
                          {/* Items */}
                          <div className="bg-white rounded-xl border border-gray-100 p-3">
                            <p className="text-[10px] font-[700] uppercase tracking-wider text-[#1A237E] mb-2">Items</p>
                            <div className="space-y-2">
                              {items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                                  {item.image && <img src={item.image} alt={item.name} className="w-9 h-9 object-cover rounded flex-shrink-0" />}
                                  <div className="flex-1 min-w-0">
                                    <div className="text-[12px] font-[500] truncate">{item.name}</div>
                                    <div className="text-[11px] text-gray-500">Qty: {item.qty || item.quantity || 1} × {inr(item.price)}</div>
                                  </div>
                                  <div className="text-[12px] font-[700] text-[#1A237E]">{inr((item.price || 0) * (item.qty || item.quantity || 1))}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                          {/* Status update */}
                          <div className="bg-white rounded-xl border border-gray-100 p-3">
                            <p className="text-[10px] font-[700] uppercase tracking-wider text-[#1A237E] mb-2">Update Status</p>
                            <MobileOrderStatusUpdate order={order} onStatusUpdated={handleStatusUpdated} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
        </div>

        <Pagination page={page} totalPages={totalPages} onChange={(p) => loadOrders(p, statusFilter, search)} />
      </div>
    </div>
  );
}

function MobileOrderStatusUpdate({ order, onStatusUpdated }) {
  const [newStatus, setNewStatus] = useState(order.status);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [courierName, setCourierName] = useState(order.courierName || "");
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await adminAxios.put(`/api/order/${order.id}/status`, { status: newStatus, trackingNumber: trackingNumber || null, courierName: courierName || null });
      toast.success(`Updated to "${newStatus}"`);
      onStatusUpdated(order.id, newStatus);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally { setUpdating(false); }
  };

  return (
    <div className="space-y-2">
      <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#1565C0] bg-white">
        {VALID_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
      </select>
      {(newStatus === "shipped" || order.status === "shipped") && (
        <>
          <input type="text" placeholder="Tracking number" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[12px] outline-none focus:border-[#1565C0]" />
          <input type="text" placeholder="Courier name" value={courierName} onChange={(e) => setCourierName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[12px] outline-none focus:border-[#1565C0]" />
        </>
      )}
      <button onClick={handleUpdate} disabled={updating}
        className="w-full py-2.5 bg-[#1565C0] text-white text-[13px] font-[600] rounded-lg hover:bg-[#1251A3] disabled:opacity-60 transition-colors">
        {updating ? "Updating…" : "Update Status"}
      </button>
    </div>
  );
}
