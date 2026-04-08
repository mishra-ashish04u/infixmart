import StoreSettings from "../models/StoreSettings.js";

// ── In-memory cache (60 s) ────────────────────────────────────────────────────
const cache = { data: null, ts: 0 };
const CACHE_TTL = 60_000;

const fetchAll = async () => {
  const rows = await StoreSettings.findAll({ raw: true });
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
};

export const invalidateSettingsCache = () => { cache.ts = 0; };

// ── Public: GET /api/settings (no auth) ──────────────────────────────────────
export const getSettingsPublic = async (req, res) => {
  try {
    if (cache.data && Date.now() - cache.ts < CACHE_TTL) {
      return res.status(200).json({ settings: cache.data, success: true, error: false });
    }
    cache.data = await fetchAll();
    cache.ts   = Date.now();
    return res.status(200).json({ settings: cache.data, success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: error.message, error: true, success: false });
  }
};

// ── Admin: GET /api/admin/settings ────────────────────────────────────────────
export const getSettingsAdmin = async (req, res) => {
  try {
    const settings = await fetchAll();
    return res.status(200).json({ settings, success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: error.message, error: true, success: false });
  }
};

// ── Admin: PUT /api/admin/settings ────────────────────────────────────────────
export const upsertSetting = async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) {
      return res.status(400).json({ message: "key is required", error: true, success: false });
    }
    await StoreSettings.upsert({ key, value: String(value ?? "") });
    invalidateSettingsCache();
    return res.status(200).json({ message: "Setting saved", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: error.message, error: true, success: false });
  }
};
