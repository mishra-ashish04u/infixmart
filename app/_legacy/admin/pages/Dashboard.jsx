"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MdShoppingBag, MdAttachMoney, MdInventory, MdPeople,
  MdTrendingUp, MdWarning, MdAdd, MdArrowForward,
  MdCheckCircle, MdLocalShipping, MdPendingActions, MdCancel,
} from "react-icons/md";
import adminAxios from "../utils/adminAxios";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const STATUS_CFG = {
  pending:    { label: "Pending",    bg: "bg-gray-100",   text: "text-gray-600",   icon: MdPendingActions },
  processing: { label: "Processing", bg: "bg-blue-100",   text: "text-blue-700",   icon: MdShoppingBag },
  shipped:    { label: "Shipped",    bg: "bg-amber-100",  text: "text-amber-700",  icon: MdLocalShipping },
  delivered:  { label: "Delivered",  bg: "bg-green-100",  text: "text-green-700",  icon: MdCheckCircle },
  cancelled:  { label: "Cancelled",  bg: "bg-red-100",    text: "text-red-700",    icon: MdCancel },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-[700] capitalize ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

function Shimmer({ h = "h-5", w = "w-full", rounded = "rounded-md" }) {
  return <div className={`${h} ${w} ${rounded} bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse`} />;
}

function StatCard({ label, value, icon: Icon, accent, sub, loading }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${accent}18`, color: accent }}>
        <Icon className="text-[22px]" />
      </div>
      <div className="min-w-0 flex-1">
        {loading ? (
          <>
            <Shimmer h="h-7" w="w-20" rounded="rounded-lg" />
            <Shimmer h="h-3.5" w="w-24" rounded="rounded" style={{ marginTop: 8 }} />
          </>
        ) : (
          <>
            <p className="text-[26px] font-[900] text-gray-800 leading-none">{value}</p>
            <p className="text-[12px] text-gray-400 font-[500] mt-1">{label}</p>
            {sub && <p className="text-[11px] text-gray-300 mt-0.5">{sub}</p>}
          </>
        )}
      </div>
    </div>
  );
}

const QUICK_ACTIONS = [
  { label: "Add Product",    href: "/admin/products/new",  primary: true  },
  { label: "Add Category",   href: "/admin/categories",    primary: true  },
  { label: "View Orders",    href: "/admin/orders",        primary: false },
  { label: "Manage Coupons", href: "/admin/coupons",       primary: false },
];

export default function Dashboard() {
  const [stats,         setStats]         = useState(null);
  const [orders,        setOrders]        = useState([]);
  const [lowStock,      setLowStock]      = useState([]);
  const [statsLoading,  setStatsLoading]  = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    adminAxios.get("/api/admin/stats")
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setStatsLoading(false));

    adminAxios.get("/api/admin/orders?page=1&perPage=6")
      .then((res) => setOrders(res.data.orders || []))
      .catch(console.error)
      .finally(() => setOrdersLoading(false));

    adminAxios.get("/api/product?perPage=50&sort=stock_asc")
      .then((res) => {
        const prods = res.data.products || [];
        setLowStock(prods.filter((p) => Number(p.countInStock) <= 5));
      })
      .catch(() => null);
  }, []);

  return (
    <div className="space-y-6">

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard label="Total Orders"       value={stats?.totalOrders    ?? "—"} icon={MdShoppingBag} accent="#1565C0" loading={statsLoading} />
        <StatCard label="Total Revenue"      value={stats ? inr(stats.totalRevenue) : "—"} icon={MdAttachMoney} accent="#00A651" loading={statsLoading} />
        <StatCard label="Total Products"     value={stats?.totalProducts  ?? "—"} icon={MdInventory}  accent="#7B1FA2" loading={statsLoading} />
        <StatCard label="Total Users"        value={stats?.totalUsers     ?? "—"} icon={MdPeople}     accent="#F59E0B" loading={statsLoading} />
        <StatCard label="Avg. Order Value"   value={stats ? inr(stats.aov) : "—"} icon={MdTrendingUp} accent="#0097A7" loading={statsLoading} />
        <StatCard label="Low Stock Products" value={stats?.lowStockCount  ?? "—"} icon={MdWarning}    accent="#E53935" loading={statsLoading}
          sub={stats?.lowStockCount > 0 ? "Needs restocking" : undefined} />
      </div>

      {/* ── Quick Actions ── */}
      <div className="flex flex-wrap gap-2">
        {QUICK_ACTIONS.map(({ label, href, primary }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-[700] transition-all ${
              primary
                ? "bg-[#1565C0] text-white hover:bg-[#1251A3] shadow-sm"
                : "bg-white border border-gray-200 text-gray-700 hover:border-[#1565C0] hover:text-[#1565C0]"
            }`}
          >
            {primary && <MdAdd className="text-[16px]" />}
            {label}
          </Link>
        ))}
      </div>

      {/* ── Recent Orders ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-[800] text-gray-800">Recent Orders</h2>
          <Link href="/admin/orders" className="flex items-center gap-1 text-[12px] font-[600] text-[#1565C0] hover:underline">
            View all <MdArrowForward className="text-[14px]" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[#F8FAFF]">
                {["Order ID", "Customer", "Date", "Amount", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-[700] uppercase tracking-wider text-gray-400 whitespace-nowrap border-b border-gray-100">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ordersLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                          <Shimmer h="h-4" w={j === 5 ? "w-12" : "w-3/4"} />
                        </td>
                      ))}
                    </tr>
                  ))
                : orders.length === 0
                ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-[13px]">
                        No orders yet.
                      </td>
                    </tr>
                  )
                : orders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-[#F8FAFF] transition-colors">
                      <td className="px-4 py-3 font-[700] text-[#1565C0]">#{order.id}</td>
                      <td className="px-4 py-3 text-gray-700 max-w-[140px] truncate">
                        {order.user?.name || order.user?.email || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{fmt(order.createdAt)}</td>
                      <td className="px-4 py-3 font-[700] text-gray-800">{inr(order.totalPrice)}</td>
                      <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                      <td className="px-4 py-3">
                        <Link href="/admin/orders" className="text-[12px] font-[600] text-[#1565C0] hover:underline whitespace-nowrap">
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Inventory Alerts ── */}
      {lowStock.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 bg-amber-50 border-b border-amber-200">
            <div className="flex items-center gap-2">
              <MdWarning className="text-amber-500 text-[20px]" />
              <span className="text-[14px] font-[700] text-amber-800">
                Inventory Alerts — {lowStock.length} product{lowStock.length > 1 ? "s" : ""} need restocking
              </span>
            </div>
            <Link href="/admin/products" className="text-[12px] font-[600] text-[#1565C0] hover:underline">
              Manage →
            </Link>
          </div>
          <div className="p-4 flex flex-wrap gap-2">
            {lowStock.map((p) => (
              <Link
                key={p.id}
                href={`/admin/products/${p.id}/edit`}
                className={`text-[12px] font-[600] px-3 py-1.5 rounded-lg transition-colors ${
                  Number(p.countInStock) === 0
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                }`}
              >
                {p.name} — {Number(p.countInStock) === 0 ? "Out of Stock" : `${p.countInStock} left`}
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
