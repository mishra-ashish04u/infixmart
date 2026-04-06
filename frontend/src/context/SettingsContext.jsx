import React, { createContext, useContext, useEffect, useState } from 'react';
import { getData } from '../utils/api';

const parseJson = (str, fallback) => {
  try { return JSON.parse(str); } catch { return fallback; }
};

const DEFAULTS = {
  minOrderValue: 999,
  codEnabled: true,
  gstPercent: 18,
  membershipPriceMonthly: 99,
  membershipPriceYearly: 799,
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
          minOrderValue:          Number(s.min_order_value)            || 999,
          codEnabled:             s.cod_enabled !== 'false',
          gstPercent:             Number(s.gst_percent)                || 18,
          membershipPriceMonthly: Number(s.membership_price_monthly)   || 99,
          membershipPriceYearly:  Number(s.membership_price_yearly)    || 799,
          cartTimelineEnabled:    s.cart_timeline_enabled !== 'false',
          cartTimelineMax:        Number(s.cart_timeline_max)          || 1999,
          cartMilestones:         parseJson(s.cart_milestones, DEFAULTS.cartMilestones),
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
