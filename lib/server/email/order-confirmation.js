import { sendEmail } from "./send-email.js";

function inr(value) {
  return `Rs.${Number(value || 0).toLocaleString("en-IN")}`;
}

function buildOrderEmailHtml(order, user) {
  const items = Array.isArray(order.items) ? order.items : [];
  const address = order.shippingAddress || {};
  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;">${item.name || "Product"}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${item.qty || 1}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">${inr(
            Number(item.price || 0) * Number(item.qty || 1)
          )}</td>
        </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
  <html>
    <body style="margin:0;padding:24px;background:#f4f6f9;font-family:Arial,sans-serif;color:#333;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:8px;overflow:hidden;">
          <tr><td style="background:#1565C0;color:#fff;padding:18px 24px;font-size:20px;font-weight:700;">InfixMart Order Confirmation</td></tr>
          <tr><td style="padding:24px;">
            <p style="margin:0 0 12px;">Hi <strong>${user?.name || "Customer"}</strong>,</p>
            <p style="margin:0 0 18px;">Your order #${order.id} has been placed successfully.</p>
            <p style="margin:0 0 18px;"><strong>Total:</strong> ${inr(order.totalPrice)}</p>
            <p style="margin:0 0 18px;"><strong>Payment:</strong> ${order.paymentMethod || "COD"}</p>
            <p style="margin:0 0 18px;"><strong>Shipping Address:</strong> ${
              [address.name, address.address, address.city, address.state, address.postalCode]
                .filter(Boolean)
                .join(", ") || "Not available"
            }</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8eaed;border-collapse:collapse;">
              <thead>
                <tr style="background:#f0f5ff;color:#1565C0;">
                  <th style="padding:10px 12px;text-align:left;">Item</th>
                  <th style="padding:10px 12px;text-align:center;">Qty</th>
                  <th style="padding:10px 12px;text-align:right;">Amount</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
            </table>
          </td></tr>
        </table>
      </td></tr></table>
    </body>
  </html>`;
}

async function sendOrderConfirmationEmail(order, user) {
  if (!user?.email) return;
  try {
    await sendEmail({
      to: user.email,
      subject: `Order Confirmed! #${order.id} - InfixMart`,
      text: `Hi ${user.name || "Customer"}, your order #${order.id} has been confirmed. Total: ${inr(order.totalPrice)}.`,
      html: buildOrderEmailHtml(order, user),
    });
  } catch (error) {
    console.error("[order-email]", error);
  }
}

export { sendOrderConfirmationEmail };
