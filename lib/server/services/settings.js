import { HttpError } from "../api/http.js";
import { listSettings, upsertSetting } from "../repositories/settings.js";

const cache = { data: null, ts: 0 };
const CACHE_TTL = 60_000;

function invalidateSettingsCache() {
  cache.ts = 0;
  cache.data = null;
}

async function getSettingsPublic() {
  if (cache.data && Date.now() - cache.ts < CACHE_TTL) {
    return { settings: cache.data, success: true, error: false };
  }

  cache.data = await listSettings();
  cache.ts = Date.now();

  return { settings: cache.data, success: true, error: false };
}

async function getSettingsAdmin() {
  return {
    settings: await listSettings(),
    success: true,
    error: false,
  };
}

async function saveSetting(body) {
  const key = body?.key;
  if (!key) {
    throw new HttpError(400, "key is required");
  }

  await upsertSetting(key, String(body?.value ?? ""));
  invalidateSettingsCache();

  return {
    message: "Setting saved",
    success: true,
    error: false,
  };
}

export { getSettingsAdmin, getSettingsPublic, invalidateSettingsCache, saveSetting };
