"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getData } from '../utils/api';

const parseJson = (str, fallback) => {
  try { return JSON.parse(str); } catch { return fallback; }
};

const DEFAULT_MEMBERSHIP_BENEFITS = [
  { icon: 'cart',    title: 'Shop from just ₹499',          subtitle: 'Half the usual ₹999 minimum — always'  },
  { icon: 'truck',   title: 'Free Delivery on Every Order',  subtitle: 'Zero shipping charges, forever'         },
  { icon: 'zap',     title: 'Priority Fast Delivery',        subtitle: 'Your orders are dispatched first'       },
  { icon: 'headset', title: 'Dedicated Customer Support',    subtitle: 'Skip the queue — member-only care'      },
];

const DEFAULTS = {
  minOrderValue: 999,
  codEnabled: true,
  gstPercent: 18,
  membershipPrice: 49,
  membershipEnabled: true,
  membershipBenefits: DEFAULT_MEMBERSHIP_BENEFITS,
  cartTimelineEnabled: true,
  cartTimelineMax: 1999,
  cartMilestones: [{ amount: 1499, label: 'Free Shipping', type: 'free_shipping', enabled: true }],
};

const SettingsContext = createContext(DEFAULTS);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULTS);

  useEffect(() => {
    getData('/api/settings').then((res) => {
      if (res && !res.error && res.settings) {
        const s = res.settings;
        setSettings({
          minOrderValue:      Number(s.min_order_value)   || 999,
          codEnabled:         s.cod_enabled !== 'false',
          gstPercent:         Number(s.gst_percent)       || 18,
          membershipPrice:    Number(s.membership_price)  || 49,
          membershipEnabled:  s.membership_enabled !== 'false',
          membershipBenefits: parseJson(s.membership_benefits, DEFAULT_MEMBERSHIP_BENEFITS),
          cartTimelineEnabled: s.cart_timeline_enabled !== 'false',
          cartTimelineMax:    Number(s.cart_timeline_max) || 1999,
          cartMilestones:     parseJson(s.cart_milestones, DEFAULTS.cartMilestones),
        });
      }
    });
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
export default SettingsContext;
