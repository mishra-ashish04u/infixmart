import { execute, query } from "../db/mysql.js";

const DEFAULT_SETTINGS = [
  { key: "min_order_value", value: "999" },
  { key: "cod_enabled", value: "true" },
  { key: "gst_percent", value: "18" },
  { key: "membership_price", value: "49" },
  { key: "membership_enabled", value: "true" },
  {
    key: "membership_benefits",
    value: JSON.stringify([
      { icon: "cart",    title: "Shop from just ₹499",           subtitle: "Half the usual ₹999 minimum — always"   },
      { icon: "truck",   title: "Free Delivery on Every Order",   subtitle: "Zero shipping charges, forever"          },
      { icon: "zap",     title: "Priority Fast Delivery",         subtitle: "Your orders are dispatched first"        },
      { icon: "headset", title: "Dedicated Customer Support",     subtitle: "Skip the queue — member-only care"       },
    ]),
  },
  { key: "cart_timeline_enabled", value: "true" },
  { key: "cart_timeline_max", value: "1999" },
  {
    key: "cart_milestones",
    value: JSON.stringify([
      { amount: 1499, label: "Free Shipping", type: "free_shipping", enabled: true },
    ]),
  },
];

const globalState =
  globalThis.__infixmartSettingsRepo ||
  (globalThis.__infixmartSettingsRepo = { ensured: false });

async function ensureDefaultSettings() {
  if (globalState.ensured) {
    return;
  }

  for (const row of DEFAULT_SETTINGS) {
    await execute(
      `INSERT INTO StoreSettings (\`key\`, \`value\`, updatedAt)
       VALUES (:key, :value, NOW())
       ON DUPLICATE KEY UPDATE updatedAt = updatedAt`,
      row
    );
  }

  globalState.ensured = true;
}

async function listSettings() {
  await ensureDefaultSettings();
  const rows = await query(
    `SELECT \`key\`, \`value\`
     FROM StoreSettings`
  );

  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

async function upsertSetting(key, value) {
  await ensureDefaultSettings();
  await execute(
    `INSERT INTO StoreSettings (\`key\`, \`value\`, updatedAt)
     VALUES (:key, :value, NOW())
     ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`), updatedAt = NOW()`,
    { key, value }
  );
}

export { listSettings, upsertSetting };
