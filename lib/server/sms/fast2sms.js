const API_KEY = process.env.FAST2SMS_API_KEY;
const BASE_URL = "https://www.fast2sms.com/dev/bulkV2";

async function sendSms(phone, message) {
  if (!API_KEY) return;
  if (!phone) return;

  const mobile = String(phone).replace(/\D/g, "").slice(-10);
  if (mobile.length !== 10) return;

  try {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        authorization: API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        route: "q",
        message,
        language: "english",
        numbers: mobile,
      }),
    });
    return await res.json();
  } catch {
    // Fire-and-forget — never block order flow
  }
}

export async function sendOrderPlacedSms(phone, orderId, total) {
  await sendSms(
    phone,
    `InfixMart: Your order #${orderId} for Rs.${total} has been placed successfully! We'll notify you when it ships. Track at infixmart.com/my-orders`
  );
}

export async function sendOrderShippedSms(phone, orderId, trackingNumber, courierName) {
  const tracking = trackingNumber ? ` Tracking: ${trackingNumber} (${courierName || "courier"}).` : "";
  await sendSms(
    phone,
    `InfixMart: Order #${orderId} has been shipped!${tracking} Track at infixmart.com/my-orders`
  );
}

export async function sendOrderDeliveredSms(phone, orderId) {
  await sendSms(
    phone,
    `InfixMart: Order #${orderId} has been delivered! Hope you love it. Rate your experience at infixmart.com/my-orders`
  );
}
