import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import useStoreSettings from '../hooks/useStoreSettings';

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

const TYPE_ICON = {
  min_order:     '🔒',
  free_shipping: '🚚',
  free_gift:     '🎁',
  discount:      '🏷️',
};

const CartTimeline = ({ cartSubtotal }) => {
  const { minOrderValue, cartTimelineEnabled, cartTimelineMax, cartMilestones } = useStoreSettings();
  const [justReached, setJustReached] = useState(new Set());
  const prevReachedRef = useRef(new Set());
  const isFirstRender  = useRef(true);

  const maxVal = cartTimelineMax || 1999;
  const progressPct = Math.min((cartSubtotal / maxVal) * 100, 100);
  const fillColor = cartSubtotal >= minOrderValue ? '#00A651' : '#1565C0';

  // Build unified milestone list — min_order always first
  const parsedMilestones = Array.isArray(cartMilestones) ? cartMilestones : [];
  const allMilestones = [
    { amount: minOrderValue, label: 'Order unlocked', type: 'min_order', enabled: true },
    ...parsedMilestones.filter((m) => m.type !== 'min_order' && m.enabled !== false),
  ].sort((a, b) => a.amount - b.amount);

  // Detect newly reached reward milestones, skip on first render
  useEffect(() => {
    const reached = new Set(allMilestones.filter((m) => cartSubtotal >= m.amount).map((m) => m.amount));

    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevReachedRef.current = reached;
      return;
    }

    const newlyReached = [];
    for (const amt of reached) {
      if (!prevReachedRef.current.has(amt)) {
        const m = allMilestones.find((ms) => ms.amount === amt);
        if (m && m.type !== 'min_order') newlyReached.push(m);
      }
    }

    if (newlyReached.length > 0) {
      newlyReached.forEach((m) =>
        toast.success(`🎉 You unlocked ${m.label}!`, { duration: 3000 })
      );
      const newSet = new Set(newlyReached.map((m) => m.amount));
      setJustReached(newSet);
      const t = setTimeout(() => setJustReached(new Set()), 400);
      prevReachedRef.current = reached;
      return () => clearTimeout(t);
    }

    prevReachedRef.current = reached;
  }, [cartSubtotal]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!cartTimelineEnabled) return null;

  // Status message
  const nextMilestone = allMilestones.find((m) => cartSubtotal < m.amount);
  const allReached    = !nextMilestone;

  let statusNode;
  if (cartSubtotal === 0) {
    statusNode = <span style={{ color: '#888' }}>Add products to your cart to start</span>;
  } else if (cartSubtotal < minOrderValue) {
    const rem = minOrderValue - cartSubtotal;
    statusNode = (
      <>Add <span style={{ color: '#1565C0', fontWeight: 700 }}>₹{fmt(rem)}</span> more to place your order</>
    );
  } else if (!allReached && nextMilestone) {
    const rem = nextMilestone.amount - cartSubtotal;
    statusNode = (
      <>Add <span style={{ color: '#00A651', fontWeight: 700 }}>₹{fmt(rem)}</span> more to get {nextMilestone.label}!</>
    );
  } else {
    statusNode = <><span style={{ color: '#00A651', marginRight: 4 }}>✓</span>You've unlocked all rewards!</>;
  }

  return (
    <div
      className="bg-white rounded-lg border border-[rgba(0,0,0,0.08)] px-5 pt-4 pb-5 mb-4"
      style={{ overflow: 'visible' }}
    >
      <style>{`
        @keyframes dot-pulse {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.55); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* Status text */}
      <p className="text-[13px] font-[500] text-gray-700 mb-0" style={{ lineHeight: 1.5 }}>
        {statusNode}
      </p>

      {/* Progress area — extra padding to accommodate icons (above) and labels (below) */}
      <div style={{ position: 'relative', paddingTop: 28, paddingBottom: 38 }}>

        {/* Track */}
        <div style={{
          position: 'relative',
          height: 8,
          background: '#E3F2FD',
          borderRadius: 8,
          overflow: 'visible',
        }}>

          {/* Animated fill */}
          <div style={{
            position: 'absolute', top: 0, left: 0, height: '100%',
            width: `${progressPct}%`,
            background: fillColor,
            borderRadius: 8,
            transition: 'width 0.4s ease, background 0.35s ease',
          }} />

          {/* Milestone dots */}
          {allMilestones.map((m) => {
            const pct       = Math.min((m.amount / maxVal) * 100, 100);
            const reached   = cartSubtotal >= m.amount;
            const isMinOrder = m.type === 'min_order';
            const isPulsing  = justReached.has(m.amount);

            const dotBg      = reached ? (isMinOrder ? '#1565C0' : '#00A651') : '#fff';
            const dotBorder  = reached ? dotBg : '#1565C0';
            const labelColor = reached ? (isMinOrder ? '#1565C0' : '#00A651') : '#aaa';

            return (
              <div
                key={m.amount}
                style={{
                  position: 'absolute',
                  left: `${pct}%`,
                  top: -3,                          /* centers 14px dot on 8px track */
                  transform: 'translateX(-50%)',
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                {/* Icon above dot */}
                <div style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginBottom: 3,
                  fontSize: 11,
                  lineHeight: 1,
                  color: reached ? labelColor : '#bbb',
                  whiteSpace: 'nowrap',
                }}>
                  {reached && isMinOrder ? '✓' : TYPE_ICON[m.type] || '●'}
                </div>

                {/* Dot circle — this is what pulses */}
                <div style={{
                  width: 14, height: 14,
                  borderRadius: '50%',
                  background: dotBg,
                  border: `2.5px solid ${dotBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animation: isPulsing ? 'dot-pulse 0.35s ease' : 'none',
                  transformOrigin: 'center',
                  boxShadow: reached ? `0 0 0 3px ${dotBg}22` : 'none',
                  transition: 'background 0.25s, border-color 0.25s',
                }} />

                {/* Labels below dot */}
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginTop: 5,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.35,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: labelColor }}>
                    ₹{fmt(m.amount)}
                  </div>
                  <div style={{ fontSize: 9, color: labelColor }}>
                    {m.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CartTimeline;
