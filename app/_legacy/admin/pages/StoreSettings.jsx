"use client";

import React, { useEffect, useState } from 'react';
import adminAxios from '../utils/adminAxios';

// ── Helpers ────────────────────────────────────────────────────────────────────
const parseJson = (str, fallback) => { try { return JSON.parse(str); } catch { return fallback; } };

// ── Reusable primitives ────────────────────────────────────────────────────────
const Section = ({ title, note, children, onSave, saving, saveLabel }) => (
  <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: '1.5rem', marginBottom: '1.25rem' }}>
    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1A237E', margin: '0 0 1.25rem' }}>{title}</h2>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>{children}</div>
    {note && <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.75rem', marginBottom: 0 }}>{note}</p>}
    <button
      onClick={onSave}
      disabled={saving}
      style={{
        marginTop: '1.25rem', padding: '0.55rem 1.5rem',
        background: saving ? '#90CAF9' : '#1565C0', color: '#fff',
        border: 'none', borderRadius: 6, fontSize: '0.875rem', fontWeight: 600,
        cursor: saving ? 'not-allowed' : 'pointer', transition: 'background 0.15s',
      }}
    >
      {saving ? 'Saving…' : (saveLabel || 'Save')}
    </button>
  </div>
);

const Field = ({ label, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#555', marginBottom: 6 }}>{label}</label>
    {children}
  </div>
);

const numInput = (value, onChange, extra = {}) => (
  <input
    type="number"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    style={{ width: 140, height: 36, padding: '0 10px', border: '1px solid #ccc', borderRadius: 6, fontSize: '0.875rem', outline: 'none' }}
    {...extra}
  />
);

const Toggle = ({ checked, onChange }) => (
  <div
    onClick={() => onChange(!checked)}
    style={{
      position: 'relative', display: 'inline-flex', alignItems: 'center',
      width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
      background: checked ? '#00A651' : '#ccc', transition: 'background 0.2s',
    }}
  >
    <span style={{
      position: 'absolute', top: 3, left: checked ? 23 : 3,
      width: 18, height: 18, borderRadius: '50%', background: '#fff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.25)', transition: 'left 0.2s',
    }} />
  </div>
);

const inputStyle = { height: 34, padding: '0 8px', border: '1px solid #ddd', borderRadius: 5, fontSize: '0.8rem', outline: 'none' };
const selectStyle = { ...inputStyle, background: '#fff', cursor: 'pointer' };

// ── Milestone live preview ────────────────────────────────────────────────────
const MilestonePreview = ({ minOrder, timelineMax, milestones }) => {
  const max = Number(timelineMax) || 1999;
  const allDots = [
    { amount: Number(minOrder) || 999, label: 'Min order', type: 'min_order' },
    ...milestones
      .filter((m) => Number(m.amount) > 0)
      .map((m) => ({ ...m, amount: Number(m.amount) })),
  ].sort((a, b) => a.amount - b.amount).filter((m) => m.amount <= max * 1.05);

  return (
    <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#F5F7FF', borderRadius: 8, border: '1px solid #e0e7ff' }}>
      <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#888', marginBottom: 12, letterSpacing: '0.05em' }}>LIVE PREVIEW</p>
      <div style={{ position: 'relative', height: 8, background: '#E3F2FD', borderRadius: 8, margin: '24px 8px 32px' }}>
        {allDots.map((dot, i) => {
          const pct = Math.min((dot.amount / max) * 100, 100);
          return (
            <div key={i} style={{ position: 'absolute', left: `${pct}%`, top: -3, transform: 'translateX(-50%)' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#1565C0', border: '2px solid #1565C0' }} />
              <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 4, textAlign: 'center', whiteSpace: 'nowrap' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#1565C0' }}>₹{dot.amount.toLocaleString('en-IN')}</div>
                <div style={{ fontSize: 8, color: '#555' }}>{dot.label}</div>
              </div>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: '0.7rem', color: '#aaa', textAlign: 'right' }}>Max: ₹{Number(timelineMax).toLocaleString('en-IN')}</p>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const StoreSettings = () => {
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast]   = useState('');

  // Section 1 — Order Rules
  const [minOrder, setMinOrder]       = useState('999');
  const [codOn, setCodOn]             = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);

  // Section 2 — GST
  const [gst, setGst]             = useState('18');
  const [savingGst, setSavingGst] = useState(false);

  // Section 3 — InfixPass Membership
  const [memEnabled, setMemEnabled]   = useState(true);
  const [memPrice, setMemPrice]       = useState('49');
  const [memBenefits, setMemBenefits] = useState([
    { icon: 'cart',    title: 'Shop from just ₹499',          subtitle: 'Half the usual ₹999 minimum — always'  },
    { icon: 'truck',   title: 'Free Delivery on Every Order',  subtitle: 'Zero shipping charges, forever'         },
    { icon: 'zap',     title: 'Priority Fast Delivery',        subtitle: 'Your orders are dispatched first'       },
    { icon: 'headset', title: 'Dedicated Customer Support',    subtitle: 'Skip the queue — member-only care'      },
  ]);
  const [savingMem, setSavingMem] = useState(false);

  // Section 4 — Cart Timeline
  const [timelineEnabled, setTimelineEnabled]   = useState(true);
  const [timelineMax, setTimelineMax]           = useState('1999');
  const [milestones, setMilestones]             = useState([]); // reward milestones only (no min_order)
  const [savingTimeline, setSavingTimeline]     = useState(false);

  useEffect(() => {
    adminAxios.get('/api/admin/settings').then((res) => {
      const s = res.data?.settings || {};
      if (s.min_order_value)          setMinOrder(s.min_order_value);
      if (s.cod_enabled !== undefined) setCodOn(s.cod_enabled !== 'false');
      if (s.gst_percent)              setGst(s.gst_percent);
      if (s.membership_price)    setMemPrice(s.membership_price);
      if (s.membership_enabled !== undefined) setMemEnabled(s.membership_enabled !== 'false');
      if (s.membership_benefits) {
        const parsed = parseJson(s.membership_benefits, null);
        if (Array.isArray(parsed) && parsed.length) setMemBenefits(parsed);
      }
      if (s.cart_timeline_enabled !== undefined) setTimelineEnabled(s.cart_timeline_enabled !== 'false');
      if (s.cart_timeline_max)        setTimelineMax(s.cart_timeline_max);
      if (s.cart_milestones) {
        const parsed = parseJson(s.cart_milestones, []);
        setMilestones(parsed.filter((m) => m.type !== 'min_order'));
      }
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const save = async (pairs, setFlag) => {
    setFlag(true);
    try {
      for (const [key, value] of pairs) {
        await adminAxios.put('/api/admin/settings', { key, value: String(value) });
      }
      showToast('Settings saved!');
    } catch {
      showToast('Failed to save settings.');
    }
    setFlag(false);
  };

  // Milestone CRUD
  const addMilestone = () =>
    setMilestones((prev) => [...prev, { amount: '', label: '', type: 'free_shipping', enabled: true }]);
  const removeMilestone = (i) =>
    setMilestones((prev) => prev.filter((_, idx) => idx !== i));
  const updateMilestone = (i, key, value) =>
    setMilestones((prev) => prev.map((m, idx) => idx === i ? { ...m, [key]: value } : m));

  const saveTimeline = async () => {
    setSavingTimeline(true);
    try {
      const milestoneData = milestones
        .filter((m) => Number(m.amount) > 0 && m.label.trim())
        .map((m) => ({ amount: Number(m.amount), label: m.label.trim(), type: m.type, enabled: Boolean(m.enabled) }));

      await Promise.all([
        adminAxios.put('/api/admin/settings', { key: 'cart_timeline_enabled', value: String(timelineEnabled) }),
        adminAxios.put('/api/admin/settings', { key: 'cart_timeline_max',     value: String(timelineMax)     }),
        adminAxios.put('/api/admin/settings', { key: 'cart_milestones',       value: JSON.stringify(milestoneData) }),
      ]);
      showToast('Settings saved!');
    } catch {
      showToast('Failed to save settings.');
    }
    setSavingTimeline(false);
  };

  if (!loaded) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
        <div style={{ width: 28, height: 28, border: '3px solid #1565C0', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680 }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: toast.startsWith('Failed') ? '#E53935' : '#00A651',
          color: '#fff', padding: '10px 20px', borderRadius: 8,
          fontSize: '0.875rem', fontWeight: 600, boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        }}>
          {toast}
        </div>
      )}

      {/* Section 1 — Order Rules */}
      <Section
        title="Order Rules"
        onSave={() => save([['min_order_value', minOrder], ['cod_enabled', String(codOn)]], setSavingOrder)}
        saving={savingOrder}
        saveLabel="Save Order Rules"
      >
        <Field label="Min Order Value (₹)">
          {numInput(minOrder, setMinOrder)}
        </Field>
        <Field label="COD Enabled">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Toggle checked={codOn} onChange={setCodOn} />
            <span style={{ fontSize: '0.8rem', color: codOn ? '#00A651' : '#888', fontWeight: 600 }}>
              {codOn ? 'On' : 'Off'}
            </span>
          </div>
        </Field>
      </Section>

      {/* Section 2 — GST */}
      <Section
        title="GST"
        note="GST is added on top of product price at checkout"
        onSave={() => save([['gst_percent', gst]], setSavingGst)}
        saving={savingGst}
        saveLabel="Save GST"
      >
        <Field label="GST Percentage (%)">
          <input
            type="number" min={0} max={100}
            value={gst} onChange={(e) => setGst(e.target.value)}
            style={{ width: 140, height: 36, padding: '0 10px', border: '1px solid #ccc', borderRadius: 6, fontSize: '0.875rem', outline: 'none' }}
          />
        </Field>
      </Section>

      {/* Section 3 — InfixPass Membership */}
      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: '1.5rem', marginBottom: '1.25rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#0D47A1,#1565C0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⭐</div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1A237E', margin: 0 }}>InfixPass Membership</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '0.78rem', color: memEnabled ? '#00A651' : '#888', fontWeight: 600 }}>{memEnabled ? 'Active' : 'Disabled'}</span>
            <Toggle checked={memEnabled} onChange={setMemEnabled} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Price */}
          <Field label="Membership Price (₹) — Lifetime, one-time payment">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {numInput(memPrice, setMemPrice, { min: 1, style: { width: 120, height: 36, padding: '0 10px', border: '1px solid #ccc', borderRadius: 6, fontSize: '0.875rem', outline: 'none' } })}
              <span style={{ fontSize: '0.78rem', color: '#888' }}>charged once, lifetime access</span>
            </div>
          </Field>

          {/* Benefits editor */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#555', marginBottom: 8 }}>
              Membership Benefits &nbsp;<span style={{ fontWeight: 400, color: '#aaa' }}>(shown in the popup card)</span>
            </label>

            {memBenefits.map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 10, padding: '10px 12px', background: '#F8F9FF', borderRadius: 8, border: '1px solid #E8ECFF' }}>
                {/* Icon picker */}
                <div>
                  <div style={{ fontSize: '0.68rem', color: '#aaa', marginBottom: 3, fontWeight: 600 }}>ICON</div>
                  <select
                    value={b.icon}
                    onChange={(e) => setMemBenefits((prev) => prev.map((x, idx) => idx === i ? { ...x, icon: e.target.value } : x))}
                    style={{ ...selectStyle, width: 90, height: 34 }}
                  >
                    <option value="cart">🛒 Cart</option>
                    <option value="truck">🚚 Truck</option>
                    <option value="zap">⚡ Zap</option>
                    <option value="headset">🎧 Support</option>
                    <option value="star">⭐ Star</option>
                    <option value="gift">🎁 Gift</option>
                    <option value="shield">🛡 Shield</option>
                  </select>
                </div>

                {/* Title */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.68rem', color: '#aaa', marginBottom: 3, fontWeight: 600 }}>TITLE</div>
                  <input
                    type="text"
                    value={b.title}
                    onChange={(e) => setMemBenefits((prev) => prev.map((x, idx) => idx === i ? { ...x, title: e.target.value } : x))}
                    placeholder="e.g. Free Delivery"
                    style={{ ...inputStyle, width: '100%' }}
                  />
                </div>

                {/* Subtitle */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.68rem', color: '#aaa', marginBottom: 3, fontWeight: 600 }}>SUBTITLE</div>
                  <input
                    type="text"
                    value={b.subtitle}
                    onChange={(e) => setMemBenefits((prev) => prev.map((x, idx) => idx === i ? { ...x, subtitle: e.target.value } : x))}
                    placeholder="Short description"
                    style={{ ...inputStyle, width: '100%' }}
                  />
                </div>

                {/* Remove */}
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'transparent', marginBottom: 3 }}>DEL</div>
                  <button
                    onClick={() => setMemBenefits((prev) => prev.filter((_, idx) => idx !== i))}
                    title="Remove benefit"
                    style={{ width: 30, height: 34, border: '1px solid #fcc', borderRadius: 6, background: '#fff5f5', cursor: 'pointer', color: '#E53935', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

            {memBenefits.length < 6 && (
              <button
                onClick={() => setMemBenefits((prev) => [...prev, { icon: 'star', title: '', subtitle: '' }])}
                style={{ padding: '6px 14px', background: '#fff', border: '1.5px solid #1565C0', color: '#1565C0', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                + Add Benefit
              </button>
            )}
          </div>

          {/* Live card preview */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#555', marginBottom: 10 }}>
              Live Card Preview &nbsp;<span style={{ fontWeight: 400, color: '#aaa' }}>(how the popup looks to customers)</span>
            </label>
            <div style={{ maxWidth: 320, border: '1px solid #e0e7ff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(13,71,161,0.10)' }}>
              {/* Modal header preview */}
              <div style={{ background: 'linear-gradient(135deg, #06266F 0%, #0D47A1 50%, #1565C0 100%)', padding: '24px 20px 20px', textAlign: 'center', position: 'relative' }}>
                <div style={{ width: 48, height: 48, background: '#FBBF24', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontSize: 22, transform: 'rotate(6deg)', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>⭐</div>
                <div style={{ color: '#fff', fontSize: 20, fontWeight: 900, letterSpacing: '-0.5px' }}>InfixPass</div>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 2 }}>Lifetime Membership</div>
                <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 3, background: '#FBBF24', color: '#fff', padding: '6px 16px', borderRadius: 20, marginTop: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>₹</span>
                  <span style={{ fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{memPrice || 49}</span>
                  <span style={{ fontSize: 11, opacity: 0.85, marginLeft: 2 }}>one-time</span>
                </div>
              </div>
              {/* Benefits preview */}
              <div style={{ padding: '14px 14px 18px', background: '#fff' }}>
                <div style={{ fontSize: 10, color: '#aaa', fontWeight: 700, letterSpacing: '0.08em', textAlign: 'center', marginBottom: 10, textTransform: 'uppercase' }}>What you unlock</div>
                {memBenefits.map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 10, background: '#F8F9FF', border: '1px solid #E8ECFF', marginBottom: 6 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: '#1565C0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>
                      {{ cart: '🛒', truck: '🚚', zap: '⚡', headset: '🎧', star: '⭐', gift: '🎁', shield: '🛡' }[b.icon] || '✦'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#1a1a1a', lineHeight: 1.3 }}>{b.title || '—'}</div>
                      <div style={{ fontSize: 10, color: '#888', lineHeight: 1.3 }}>{b.subtitle || '—'}</div>
                    </div>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#00A651', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: '#fff', flexShrink: 0 }}>✓</div>
                  </div>
                ))}
                <div style={{ marginTop: 10, background: '#1565C0', borderRadius: 10, padding: '10px', textAlign: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>
                  Unlock InfixPass — ₹{memPrice || 49} →
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save */}
        <button
          onClick={() => {
            const validBenefits = memBenefits.filter((b) => b.title.trim());
            save([
              ['membership_enabled', String(memEnabled)],
              ['membership_price',   String(memPrice)],
              ['membership_benefits', JSON.stringify(validBenefits)],
            ], setSavingMem);
          }}
          disabled={savingMem}
          style={{
            marginTop: '1.25rem', padding: '0.55rem 1.5rem',
            background: savingMem ? '#90CAF9' : '#1565C0', color: '#fff',
            border: 'none', borderRadius: 6, fontSize: '0.875rem', fontWeight: 600,
            cursor: savingMem ? 'not-allowed' : 'pointer', transition: 'background 0.15s',
          }}
        >
          {savingMem ? 'Saving…' : 'Save InfixPass Settings'}
        </button>
      </div>

      {/* Section 4 — Cart Progress Timeline */}
      <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', padding: '1.5rem', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1A237E', margin: '0 0 1.25rem' }}>
          Cart Progress Timeline
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Timeline toggle */}
          <Field label="Timeline Enabled">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Toggle checked={timelineEnabled} onChange={setTimelineEnabled} />
              <span style={{ fontSize: '0.8rem', color: timelineEnabled ? '#00A651' : '#888', fontWeight: 600 }}>
                {timelineEnabled ? 'On' : 'Off'}
              </span>
            </div>
          </Field>

          {/* Timeline max */}
          <Field label="Timeline Max Value (₹)">
            {numInput(timelineMax, setTimelineMax)}
            <p style={{ fontSize: '0.7rem', color: '#aaa', marginTop: 4 }}>
              The ₹ value at which the progress bar reaches 100%
            </p>
          </Field>

          {/* Reward milestones */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#555', marginBottom: 8 }}>
              Reward Milestones
            </label>

            <p style={{ fontSize: '0.72rem', color: '#aaa', marginBottom: 10 }}>
              The minimum order milestone is added automatically from your Min Order Value setting.
            </p>

            {/* Read-only min_order row */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 10px', background: '#F5F5F5', borderRadius: 6, marginBottom: 8, opacity: 0.8 }}>
              <span style={{ fontSize: '0.8rem', color: '#555' }}>₹</span>
              <span style={{ width: 90, fontSize: '0.8rem', fontWeight: 700, color: '#333' }}>{minOrder || 999}</span>
              <span style={{ flex: 1, fontSize: '0.8rem', color: '#555' }}>Order unlocked</span>
              <span style={{ fontSize: '0.75rem', color: '#888', background: '#e0e0e0', padding: '2px 8px', borderRadius: 4 }}>min_order · always on</span>
            </div>

            {/* Editable reward milestone rows */}
            {milestones.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', color: '#555' }}>₹</span>
                <input
                  type="number"
                  value={m.amount}
                  onChange={(e) => updateMilestone(i, 'amount', e.target.value)}
                  placeholder="Amount"
                  style={{ ...inputStyle, width: 90 }}
                />
                <input
                  type="text"
                  value={m.label}
                  onChange={(e) => updateMilestone(i, 'label', e.target.value)}
                  placeholder="Label e.g. Free Shipping"
                  style={{ ...inputStyle, width: 170 }}
                />
                <select
                  value={m.type}
                  onChange={(e) => updateMilestone(i, 'type', e.target.value)}
                  style={{ ...selectStyle, width: 130 }}
                >
                  <option value="free_shipping">Free Shipping</option>
                  <option value="free_gift">Free Gift</option>
                  <option value="discount">Discount</option>
                </select>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Toggle checked={!!m.enabled} onChange={(v) => updateMilestone(i, 'enabled', v)} />
                  <span style={{ fontSize: '0.72rem', color: m.enabled ? '#00A651' : '#aaa' }}>
                    {m.enabled ? 'On' : 'Off'}
                  </span>
                </div>
                <button
                  onClick={() => removeMilestone(i)}
                  title="Remove milestone"
                  style={{ width: 28, height: 28, border: '1px solid #eee', borderRadius: 6, background: '#fff', cursor: 'pointer', color: '#E53935', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              onClick={addMilestone}
              style={{
                marginTop: 4, padding: '6px 14px',
                background: '#fff', border: '1.5px solid #1565C0',
                color: '#1565C0', borderRadius: 6,
                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              + Add Milestone
            </button>
          </div>

          {/* Live preview */}
          <MilestonePreview minOrder={minOrder} timelineMax={timelineMax} milestones={milestones} />
        </div>

        <button
          onClick={saveTimeline}
          disabled={savingTimeline}
          style={{
            marginTop: '1.25rem', padding: '0.55rem 1.5rem',
            background: savingTimeline ? '#90CAF9' : '#1565C0', color: '#fff',
            border: 'none', borderRadius: 6, fontSize: '0.875rem', fontWeight: 600,
            cursor: savingTimeline ? 'not-allowed' : 'pointer', transition: 'background 0.15s',
          }}
        >
          {savingTimeline ? 'Saving…' : 'Save Timeline Settings'}
        </button>
      </div>
    </div>
  );
};

export default StoreSettings;
