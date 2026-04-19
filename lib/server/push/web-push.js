import webpush from "web-push";
import { execute, query } from "../db/mysql.js";

const VAPID_PUBLIC  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_EMAIL   = process.env.VAPID_EMAIL || "mailto:support@infixmart.com";

function isConfigured() {
  return Boolean(VAPID_PUBLIC && VAPID_PRIVATE);
}

if (isConfigured()) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);
}

async function ensureTable() {
  await execute(`
    CREATE TABLE IF NOT EXISTS PushSubscriptions (
      id          INT AUTO_INCREMENT PRIMARY KEY,
      userId      INT DEFAULT NULL,
      endpoint    TEXT NOT NULL,
      p256dh      TEXT NOT NULL,
      auth        TEXT NOT NULL,
      createdAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_endpoint (endpoint(512))
    )
  `);
}

export async function saveSubscription(subscription, userId = null) {
  await ensureTable();
  const { endpoint, keys } = subscription;
  await execute(
    `INSERT INTO PushSubscriptions (userId, endpoint, p256dh, auth)
     VALUES (:userId, :endpoint, :p256dh, :auth)
     ON DUPLICATE KEY UPDATE userId = VALUES(userId), p256dh = VALUES(p256dh), auth = VALUES(auth)`,
    { userId, endpoint, p256dh: keys.p256dh, auth: keys.auth }
  );
}

export async function sendPushToUser(userId, payload) {
  if (!isConfigured()) return;
  await ensureTable();
  const rows = await query(
    `SELECT endpoint, p256dh, auth FROM PushSubscriptions WHERE userId = :userId`,
    { userId }
  );
  for (const row of rows) {
    try {
      await webpush.sendNotification(
        { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
        JSON.stringify(payload)
      );
    } catch (err) {
      if (err.statusCode === 410) {
        await execute(`DELETE FROM PushSubscriptions WHERE endpoint = :endpoint`, { endpoint: row.endpoint });
      }
    }
  }
}

export async function broadcastPush(payload) {
  if (!isConfigured()) return;
  await ensureTable();
  const rows = await query(`SELECT endpoint, p256dh, auth FROM PushSubscriptions`);
  for (const row of rows) {
    try {
      await webpush.sendNotification(
        { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
        JSON.stringify(payload)
      );
    } catch (err) {
      if (err.statusCode === 410) {
        await execute(`DELETE FROM PushSubscriptions WHERE endpoint = :endpoint`, { endpoint: row.endpoint });
      }
    }
  }
}

export { VAPID_PUBLIC, isConfigured };
