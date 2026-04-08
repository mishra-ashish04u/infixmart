import React, { useEffect, useState } from 'react';
import AccountSidebar from '../../components/AccountSidebar';
import { LuClipboardCheck } from 'react-icons/lu';
import EmptyState from '../../components/EmptyState';
import { FaAngleDown, FaAngleUp, FaUndo } from 'react-icons/fa';
import { MdReceiptLong } from 'react-icons/md';
import { getData, postData } from '../../utils/api';
import { imgUrl } from '../../utils/imageUrl';
import OrderCardSkeleton from '../../components/skeletons/OrderCardSkeleton';
import Invoice from '../../components/Invoice';
import toast from 'react-hot-toast';

const statusConfig = {
  pending:    { label: 'Pending',    cls: 'bg-gray-100 text-gray-600' },
  processing: { label: 'Processing', cls: 'bg-[#1565C0] text-white' },
  shipped:    { label: 'Shipped',    cls: 'border border-[#1565C0] text-[#1565C0] bg-white' },
  delivered:  { label: 'Delivered',  cls: 'bg-[#00A651] text-white' },
  cancelled:  { label: 'Cancelled',  cls: 'bg-red-100 text-red-600' },
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig.pending;
  return (
    <span className={`text-[11px] font-[600] px-3 py-1 rounded-full capitalize inline-block ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [invoiceOrder, setInvoiceOrder]   = useState(null);
  const [returnOrderId, setReturnOrderId] = useState(null); // order id for return modal
  const [returnReason, setReturnReason]   = useState('');
  const [returnLoading, setReturnLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await getData('/api/order/myorders');
      if (res && !res.error) setOrders(res.orders || []);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnReason.trim()) { toast.error('Please describe the reason for return'); return; }
    setReturnLoading(true);
    const res = await postData('/api/returns', { orderId: returnOrderId, reason: returnReason });
    setReturnLoading(false);
    if (res && !res.error) {
      toast.success('Return request submitted successfully!');
      setReturnOrderId(null);
      setReturnReason('');
    } else {
      toast.error(res?.message || 'Failed to submit return request');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  };

  return (
  <>
    <section className="w-full py-10">
      <div className="container flex flex-col md:flex-row gap-5">
        <div className="col1 hidden md:block md:w-[20%]">
          <AccountSidebar />
        </div>

        <div className="col2 w-full md:w-[80%]">
          <div className="bg-white rounded-lg shadow-sm border border-[rgba(0,0,0,0.08)]">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-[600] text-gray-800">My Orders</h2>
                <p className="text-[13px] text-gray-500 mb-0 mt-0">
                  <span className="font-[600] text-[#1565C0]">{orders.length}</span>{' '}
                  {orders.length === 1 ? 'order' : 'orders'} placed
                </p>
              </div>
              <LuClipboardCheck className="text-[#1565C0] text-[22px]" />
            </div>

            {loading ? (
              <div className="divide-y divide-gray-100">
                {Array.from({ length: 5 }).map((_, i) => <OrderCardSkeleton key={i} />)}
              </div>
            ) : orders.length === 0 ? (
              <EmptyState
                icon={<LuClipboardCheck />}
                title="No orders yet"
                subtitle="Your placed orders will appear here."
                actionLabel="Start Shopping"
                onAction={() => window.location.href = '/productListing'}
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {orders.map((order) => {
                  const items = Array.isArray(order.items) ? order.items : [];
                  const addr = order.shippingAddress || {};
                  const isOpen = expandedId === order.id;
                  const previewItems = items.slice(0, 3);
                  const extraCount = items.length - 3;

                  return (
                    <div key={order.id} className="p-5">
                      {/* Order header row */}
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className="text-[12px] text-gray-400 font-[500]">Order ID:</span>
                            <span className="text-[12px] font-[600] text-[#1565C0] break-all">
                              #{order.id}
                            </span>
                            <StatusBadge status={order.status} />
                          </div>

                          <div className="flex flex-wrap gap-4 text-[12px] text-gray-500 mb-3">
                            <span>
                              <span className="font-[500]">Date:</span> {formatDate(order.createdAt)}
                            </span>
                            <span>
                              <span className="font-[500]">Total:</span>{' '}
                              <span className="font-[700] text-gray-800">
                                ₹{Number(order.totalPrice || 0).toLocaleString('en-IN')}
                              </span>
                            </span>
                            <span>
                              <span className="font-[500]">Payment:</span>{' '}
                              <span className="capitalize">{order.paymentMethod || 'COD'}</span>
                            </span>
                          </div>

                          {/* Thumbnail strip */}
                          <div className="flex items-center gap-2">
                            {previewItems.map((item, idx) => (
                              <div
                                key={idx}
                                className="w-10 h-10 rounded-md overflow-hidden border border-gray-200 flex-shrink-0"
                              >
                                <img
                                  src={imgUrl(item.image) || 'https://via.placeholder.com/40'}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                            {extraCount > 0 && (
                              <span className="text-[11px] font-[600] text-gray-500">
                                +{extraCount} more
                              </span>
                            )}
                          </div>

                          {addr.address && (
                            <p className="text-[11px] text-gray-400 mt-2">
                              Ship to: {addr.address}, {addr.city} {addr.postalCode}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 flex-shrink-0 mt-1">
                          <button
                            onClick={() => toggleExpand(order.id)}
                            className="flex items-center gap-1 text-[12px] font-[600] text-[#1565C0] hover:text-[#0D47A1] transition-colors"
                          >
                            {isOpen ? (
                              <><FaAngleUp className="text-[11px]" /> Hide Details</>
                            ) : (
                              <><FaAngleDown className="text-[11px]" /> View Details</>
                            )}
                          </button>
                          <button
                            onClick={() => setInvoiceOrder(order)}
                            className="flex items-center gap-1 text-[12px] font-[600] text-gray-500 hover:text-[#1565C0] transition-colors"
                          >
                            <MdReceiptLong className="text-[13px]" /> Invoice
                          </button>
                          {order.status === 'delivered' && (
                            <button
                              onClick={() => { setReturnOrderId(order.id); setReturnReason(''); }}
                              className="flex items-center gap-1 text-[12px] font-[600] text-gray-500 hover:text-red-500 transition-colors"
                            >
                              <FaUndo className="text-[11px]" /> Return
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expanded items */}
                      {isOpen && (
                        <div className="mt-4 rounded-md border border-gray-100 overflow-hidden overflow-x-auto">
                          <table className="w-full min-w-[480px] text-[12px] text-left text-gray-600">
                            <thead className="bg-gray-50 text-[11px] uppercase text-gray-500">
                              <tr>
                                <th className="px-4 py-2">Product</th>
                                <th className="px-4 py-2 text-center">Qty</th>
                                <th className="px-4 py-2 text-right">Price</th>
                                <th className="px-4 py-2 text-right">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {items.map((item, idx) => (
                                <tr key={idx} className="bg-white hover:bg-gray-50">
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 rounded-md overflow-hidden border border-gray-200 flex-shrink-0">
                                        <img
                                          src={imgUrl(item.image) || 'https://via.placeholder.com/36'}
                                          alt={item.name}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <span className="font-[500] text-gray-700 line-clamp-2 max-w-[240px]">
                                        {item.name}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-center font-[500]">{item.qty}</td>
                                  <td className="px-4 py-3 text-right font-[500]">
                                    ₹{Number(item.price).toLocaleString('en-IN')}
                                  </td>
                                  <td className="px-4 py-3 text-right font-[600] text-gray-800">
                                    ₹{Number(item.price * item.qty).toLocaleString('en-IN')}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="bg-gray-50">
                              <tr>
                                <td colSpan={3} className="px-4 py-2 text-right font-[600] text-gray-700">
                                  Total
                                </td>
                                <td className="px-4 py-2 text-right font-[700] text-[#1565C0] text-[13px]">
                                  ₹{Number(order.totalPrice || 0).toLocaleString('en-IN')}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>

    {/* Invoice modal */}
    {invoiceOrder && (
      <Invoice order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />
    )}

    {/* Return request modal */}
    {returnOrderId && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] flex items-center justify-center px-4">
        <form
          onSubmit={handleReturnSubmit}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-[16px] font-[700] text-gray-800 mb-1">Request a Return</h3>
          <p className="text-[13px] text-gray-500 mb-4">
            Order #{returnOrderId} — Describe the issue and we'll process your return within 2 business days.
          </p>
          <textarea
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            rows={4}
            placeholder="E.g. Product received is damaged / wrong item delivered..."
            className="w-full border border-gray-200 rounded-lg p-3 text-[13px] text-gray-700 resize-none focus:outline-none focus:border-[#1565C0] mb-4"
          />
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={returnLoading}
              className="flex-1 py-2.5 bg-[#1565C0] text-white text-[13px] font-[600] rounded-lg hover:bg-[#0D47A1] transition-colors disabled:opacity-60"
            >
              {returnLoading ? 'Submitting…' : 'Submit Return Request'}
            </button>
            <button
              type="button"
              onClick={() => setReturnOrderId(null)}
              className="px-5 py-2.5 border border-gray-200 text-[13px] font-[500] rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    )}
  </>
  );
};

export default Orders;
