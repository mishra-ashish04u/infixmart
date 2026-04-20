"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { MdEdit, MdDelete, MdAdd, MdSearch, MdMoreVert, MdStar, MdInventory, MdWarning } from "react-icons/md";
import adminAxios from "../utils/adminAxios";
import TableRowSkeleton from "../../components/skeletons/TableRowSkeleton";
import EmptyState from "../../components/EmptyState";
import toast, { Toaster } from "react-hot-toast";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const LOW_STOCK_THRESHOLD = 5;

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex gap-1.5 justify-center py-4 flex-wrap px-4">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button key={p} onClick={() => onChange(p)}
          className={`w-8 h-8 rounded-lg text-[13px] font-[500] border transition-colors ${
            p === page ? "bg-[#1565C0] text-white border-[#1565C0]" : "bg-white text-gray-700 border-gray-200 hover:border-[#1565C0]"
          }`}>
          {p}
        </button>
      ))}
    </div>
  );
}

function ActionMenu({ product, onEdit, onDelete, onQuickAction, busyKey }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);

  const items = [
    { key: "edit",            label: "Edit Product",                  onClick: onEdit },
    { key: "mark-sold-out",   label: "Mark Sold Out",                 onClick: () => onQuickAction("mark-sold-out") },
    { key: "mark-in-stock",   label: "Restock Product",               onClick: () => onQuickAction("mark-in-stock") },
    { key: "toggle-featured", label: product.isFeatured ? "Remove Featured" : "Mark Featured", onClick: () => onQuickAction("toggle-featured") },
    { key: "delete",          label: "Delete Product",                onClick: onDelete, danger: true },
  ];

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors border border-gray-200">
        <MdMoreVert className="text-[18px]" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-1 overflow-hidden">
          {items.map((item) => {
            const busy = busyKey === `${product.id}:${item.key}`;
            return (
              <button key={item.key} onClick={() => { item.onClick(); setOpen(false); }} disabled={!!busyKey}
                className={`w-full text-left px-4 py-2.5 text-[13px] font-[500] transition-colors ${
                  item.danger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"
                } disabled:opacity-50`}>
                {busy ? "Updating…" : item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ProductManagement() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionLoadingKey, setActionLoadingKey] = useState("");
  const debounceRef = useRef(null);

  const lowStockProducts = products.filter((p) => Number(p.countInStock) <= LOW_STOCK_THRESHOLD && Number(p.countInStock) >= 0);

  const loadProducts = async (p = 1, q = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, perPage: 20 });
      if (q) params.set("search", q);
      const res = await adminAxios.get(`/api/product?${params}`);
      setProducts(res.data.products || []);
      setTotalPages(res.data.totalPages || 1);
      setPage(p);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadProducts(1, search); }, [search]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(val), 400);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminAxios.delete(`/api/product/deleteproduct/${deleteTarget.id}`);
      setDeleteTarget(null);
      loadProducts(page, search);
    } catch (err) { console.error(err); }
    finally { setDeleting(false); }
  };

  const handleQuickAction = async (product, action) => {
    const actionKey = `${product.id}:${action}`;
    setActionLoadingKey(actionKey);
    try {
      const res = await adminAxios.patch(`/api/product/quick-action/${product.id}`, { action });
      setProducts((prev) => prev.map((item) => item.id === product.id ? { ...item, ...res.data.product } : item));
      toast.success(res.data.message || "Product updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally { setActionLoadingKey(""); }
  };

  return (
    <div className="space-y-4">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-[16px] font-[700] text-[#1A237E]">
          Products {!loading && <span className="font-[400] text-gray-400 text-[13px]">({products.length} shown)</span>}
        </h2>
        <div className="flex gap-2 items-center">
          <div className="relative flex-1 sm:flex-none">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]" />
            <input value={searchInput} onChange={handleSearchChange} placeholder="Search products…"
              className="w-full sm:w-52 pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-[13px] outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/10" />
          </div>
          <button onClick={() => router.push("/admin/products/new")}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1565C0] text-white text-[13px] font-[700] rounded-xl hover:bg-[#1251A3] transition-colors whitespace-nowrap shadow-sm">
            <MdAdd className="text-[18px]" /> Add Product
          </button>
        </div>
      </div>

      {/* Low stock alert */}
      {!loading && lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <MdWarning className="text-amber-500 text-[18px]" />
            <p className="text-[13px] font-[700] text-amber-800">
              {lowStockProducts.length} product{lowStockProducts.length > 1 ? "s" : ""} low on stock (≤{LOW_STOCK_THRESHOLD} units)
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStockProducts.map((p) => (
              <span key={p.id} onClick={() => router.push(`/admin/products/${p.id}/edit`)}
                className={`text-[11px] font-[600] px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                  Number(p.countInStock) === 0 ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                }`}>
                {p.name} — {Number(p.countInStock) === 0 ? "Out of Stock" : `${p.countInStock} left`}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-[#F8FAFF]">
                {["Image", "Name", "Category", "Price", "Stock", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-[700] uppercase tracking-wider text-gray-400 whitespace-nowrap border-b border-gray-100">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <TableRowSkeleton key={i} cols={7} widths={[50, 160, 90, 70, 55, 60, 80]} />)
                : products.length === 0
                ? <tr><td colSpan={7}><EmptyState icon={<MdInventory style={{ fontSize: 64 }} />} title="No products yet" subtitle="Add your first product to get started." actionLabel="Add Product" onAction={() => router.push("/admin/products/new")} /></td></tr>
                : products.map((product, i) => (
                    <tr key={product.id} className={`border-b border-gray-50 hover:bg-[#F8FAFF] transition-colors ${i % 2 !== 0 ? "bg-[#FAFAFA]" : ""}`}>
                      <td className="px-4 py-3">
                        {product.images?.[0]
                          ? <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded-xl border border-gray-100" onError={(e) => { e.target.style.display = "none"; }} />
                          : <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-[10px]">No img</div>
                        }
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <div className="font-[500] text-gray-800 truncate">{product.name}</div>
                        {product.brand && <div className="text-[11px] text-gray-400 mt-0.5">{product.brand}</div>}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{product.catName || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="font-[600] text-[#1A237E]">{inr(product.price)}</div>
                        {product.oldprice > 0 && <div className="text-[11px] text-gray-400 line-through">{inr(product.oldprice)}</div>}
                      </td>
                      <td className={`px-4 py-3 font-[600] ${product.countInStock > 0 ? "text-gray-700" : "text-red-600"}`}>
                        {product.countInStock}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-[600] ${product.countInStock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {product.countInStock > 0 ? "In Stock" : "Out of Stock"}
                          </span>
                          {product.isFeatured && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-[600] bg-amber-100 text-amber-700 flex items-center gap-0.5">
                              <MdStar className="text-[12px]" /> Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                            className="p-1.5 bg-blue-50 rounded-lg text-[#1565C0] hover:bg-blue-100 transition-colors border border-blue-100">
                            <MdEdit className="text-[16px]" />
                          </button>
                          <button onClick={() => setDeleteTarget(product)}
                            className="p-1.5 bg-red-50 rounded-lg text-red-600 hover:bg-red-100 transition-colors border border-red-100">
                            <MdDelete className="text-[16px]" />
                          </button>
                          <ActionMenu
                            product={product}
                            onEdit={() => router.push(`/admin/products/${product.id}/edit`)}
                            onDelete={() => setDeleteTarget(product)}
                            onQuickAction={(action) => handleQuickAction(product, action)}
                            busyKey={actionLoadingKey}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onChange={(p) => loadProducts(p, search)} />
      </div>

      {/* Mobile card grid */}
      <div className="md:hidden">
        {loading
          ? <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 space-y-2">
                  <div className="w-full h-28 bg-gray-200 rounded-xl animate-pulse" />
                  <div className="h-3.5 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          : products.length === 0
          ? <div className="bg-white rounded-2xl border border-gray-100 py-12 text-center text-gray-400 text-[13px]">
              No products yet.{" "}
              <button onClick={() => router.push("/admin/products/new")} className="text-[#1565C0] font-[600]">Add one</button>
            </div>
          : <>
              <div className="grid grid-cols-2 gap-3">
                {products.map((product) => (
                  <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Image */}
                    <div className="relative">
                      {product.images?.[0]
                        ? <img src={product.images[0]} alt={product.name} className="w-full h-28 object-cover" />
                        : <div className="w-full h-28 bg-gray-100 flex items-center justify-center text-gray-300 text-[11px]">No image</div>
                      }
                      {product.isFeatured && (
                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-amber-400 text-white text-[9px] font-[700] rounded-full flex items-center gap-0.5">
                          <MdStar className="text-[10px]" /> Featured
                        </span>
                      )}
                      <span className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[9px] font-[700] rounded-full ${product.countInStock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {product.countInStock > 0 ? `${product.countInStock} left` : "Out"}
                      </span>
                    </div>
                    {/* Info */}
                    <div className="p-2.5">
                      <div className="text-[12px] font-[600] text-gray-800 truncate mb-0.5">{product.name}</div>
                      <div className="text-[11px] text-gray-400 truncate mb-2">{product.catName || product.brand || "—"}</div>
                      <div className="text-[13px] font-[800] text-[#1A237E] mb-2">{inr(product.price)}</div>
                      <div className="flex gap-1.5">
                        <button onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                          className="flex-1 py-1.5 bg-blue-50 text-[#1565C0] text-[11px] font-[600] rounded-lg hover:bg-blue-100 transition-colors">
                          Edit
                        </button>
                        <button onClick={() => setDeleteTarget(product)}
                          className="flex-1 py-1.5 bg-red-50 text-red-600 text-[11px] font-[600] rounded-lg hover:bg-red-100 transition-colors">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={(p) => loadProducts(p, search)} />
            </>
        }
      </div>

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[300] p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-[16px] font-[700] text-[#1A237E] mb-2">Delete Product</h3>
            <p className="text-[13px] text-gray-600 mb-5 leading-relaxed">
              Are you sure you want to delete <strong>"{deleteTarget.name}"</strong>? This cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 bg-gray-100 text-gray-600 text-[13px] font-[600] rounded-xl hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white text-[13px] font-[600] rounded-xl hover:bg-red-700 disabled:opacity-60 transition-colors">
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
