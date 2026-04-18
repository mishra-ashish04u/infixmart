import {
  listAbandonedCarts,
  getCartItemsForUser,
  upsertReminder,
  setReminderStatus,
} from "../repositories/abandoned-cart.js";
import { findUserById } from "../repositories/users.js";
import { sendAbandonedCartEmail } from "../email/abandoned-cart.js";

// Send WhatsApp via Meta Cloud API
// Env vars needed: WHATSAPP_API_TOKEN, WHATSAPP_PHONE_NUMBER_ID
async function sendWhatsAppMessage(phone, user, items, subtotal) {
  const token     = process.env.WHATSAPP_API_TOKEN;
  const phoneId   = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneId) {
    return { success: false, error: "WhatsApp API not configured. Set WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID." };
  }

  // Sanitize phone: remove non-digits, ensure country code (default +91 India)
  const raw = String(phone || "").replace(/\D/g, "");
  const to  = raw.startsWith("91") ? raw : `91${raw}`;

  if (to.length < 11) {
    return { success: false, error: "Invalid phone number" };
  }

  const cartUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://infixmart.com"}/cart`;
  const firstName = (user.name || "there").split(" ")[0];
  const itemSummary = items.slice(0, 3).map((i) => `• ${i.name} (x${i.quantity})`).join("\n");
  const body = `Hi ${firstName}! 👋\n\nYou left ₹${Number(subtotal).toLocaleString("en-IN")} worth of items in your InfixMart cart:\n\n${itemSummary}${items.length > 3 ? `\n• ...and ${items.length - 3} more` : ""}\n\nComplete your order here 👉 ${cartUrl}`;

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${phoneId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body },
        }),
      }
    );

    const json = await res.json();
    if (!res.ok) {
      return { success: false, error: json?.error?.message || "WhatsApp API error" };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function getAbandonedCarts({ page = 1, perPage = 30, minIdleMinutes = 60, dateFrom = null, dateTo = null, exportAll = false } = {}) {
  const { rows, total } = await listAbandonedCarts({ minIdleMinutes, page, perPage, dateFrom, dateTo, exportAll });
  return {
    carts: rows.map((r) => ({
      userId: r.userId,
      userName: r.userName,
      userEmail: r.userEmail,
      userPhone: r.userPhone,
      itemCount: Number(r.itemCount || 0),
      cartSubtotal: Number(r.cartSubtotal || 0),
      lastCartActivity: r.lastCartActivity,
      idleMinutes: Number(r.idleMinutes || 0),
      reminderId: r.reminderId,
      reminderStatus: r.reminderStatus || "none",
      lastEmailSentAt: r.lastEmailSentAt,
      lastWhatsappSentAt: r.lastWhatsappSentAt,
      emailCount: Number(r.emailCount || 0),
      whatsappCount: Number(r.whatsappCount || 0),
    })),
    total,
    page,
    perPage,
    pages: Math.ceil(total / perPage),
  };
}

export async function sendAbandonedCartReminder(userId, channel) {
  const [user, items] = await Promise.all([
    findUserById(userId),
    getCartItemsForUser(userId),
  ]);

  if (!user) throw new Error("User not found");
  if (!items.length) throw new Error("Cart is empty");

  const subtotal = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
  const cartSnapshot = items.map((i) => ({ name: i.name, price: i.price, qty: i.quantity }));

  let result;

  if (channel === "email") {
    result = await sendAbandonedCartEmail(user, items, subtotal);
  } else if (channel === "whatsapp") {
    if (!user.mobile) return { success: false, error: "User has no phone number on file" };
    result = await sendWhatsAppMessage(user.mobile, user, items, subtotal);
  } else {
    throw new Error("Invalid channel. Use 'email' or 'whatsapp'.");
  }

  if (result.success) {
    await upsertReminder(userId, { cartSubtotal: subtotal, cartSnapshot, channel });
  }

  return result;
}

export async function dismissAbandonedCart(userId) {
  await setReminderStatus(userId, "dismissed");
  return { success: true };
}
