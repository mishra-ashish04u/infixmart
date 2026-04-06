export const SITE_NAME = import.meta.env.VITE_SITE_NAME || "InfixMart Wholesale";
export const SITE_URL = (import.meta.env.VITE_SITE_URL || "https://infixmart.com").replace(/\/+$/, "");
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/strechBanner.png`;

export const buildAbsoluteUrl = (path = "/") => {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};
