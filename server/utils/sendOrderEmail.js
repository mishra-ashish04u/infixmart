import sendEmail from "../config/emailService.js";

const inr = (n) => `&#8377;${Number(n).toLocaleString('en-IN')}`;
const FREE_SHIPPING_THRESHOLD = 999;

const buildOrderEmailHtml = (order, user) => {
  const items   = Array.isArray(order.items) ? order.items : [];
  const addr    = order.shippingAddress || {};
  const isPaid  = order.isPaid;
  const date    = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const itemsTotal   = order.itemsPrice  || 0;
  const shippingCost = order.shippingPrice || 0;
  const gstAmount    = parseFloat(order.gstAmount || 0);
  const total        = order.totalPrice   || 0;

  const addrLine = [addr.name, addr.address, addr.city, addr.state].filter(Boolean).join(', ');
  const pinLine  = addr.postalCode ? ` - ${addr.postalCode}` : '';

  // ── Item rows ──────────────────────────────────────────────────────────────
  const itemRows = items.map((item) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#333;">
        ${item.name || 'Product'}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#555;text-align:center;">
        ${item.qty || 1}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#333;text-align:right;white-space:nowrap;">
        ${inr((item.price || 0) * (item.qty || 1))}
      </td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Order Confirmed</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:Arial,Helvetica,sans-serif;color:#333;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

          <!-- HEADER BANNER -->
          <tr>
            <td style="background-color:#1565C0;padding:0 28px;height:60px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:#fff;font-size:20px;font-weight:700;letter-spacing:0.5px;">
                    InfixMart
                  </td>
                  <td style="color:#e3f0ff;font-size:14px;font-weight:600;text-align:right;">
                    &#10003;&nbsp;Order Confirmed
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:28px 28px 8px;">

              <!-- GREETING -->
              <p style="font-size:15px;margin:0 0 6px;color:#222;">Hi <strong>${user?.name || 'Customer'}</strong>,</p>
              <p style="font-size:14px;color:#555;margin:0 0 24px;line-height:1.6;">
                Thank you for your order! We&rsquo;ve received your payment and are processing your order.
                You&rsquo;ll receive a shipping update once your package is on its way.
              </p>

              <!-- ORDER INFO BOX -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background-color:#f8f9fb;border-radius:6px;border:1px solid #e8eaed;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:12px;color:#888;padding-bottom:8px;width:50%;">
                          <strong style="color:#444;">Order ID</strong><br/>
                          <span style="color:#1565C0;font-weight:600;">#${order.id}</span>
                        </td>
                        <td style="font-size:12px;color:#888;padding-bottom:8px;">
                          <strong style="color:#444;">Order Date</strong><br/>
                          <span style="color:#333;">${date}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size:12px;color:#888;padding-top:4px;width:50%;">
                          <strong style="color:#444;">Payment</strong><br/>
                          <span style="color:#00A651;font-weight:600;">
                            ${order.paymentMethod || 'Razorpay'}${isPaid ? ' &bull; Paid &#10003;' : ''}
                          </span>
                        </td>
                        <td style="font-size:12px;color:#888;padding-top:4px;">
                          <strong style="color:#444;">Deliver to</strong><br/>
                          <span style="color:#333;">${addrLine}${pinLine}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- ITEMS TABLE -->
              <p style="font-size:14px;font-weight:700;color:#222;margin:0 0 10px;">Order Items</p>
              <table width="100%" cellpadding="0" cellspacing="0"
                style="border:1px solid #e8eaed;border-radius:6px;overflow:hidden;margin-bottom:16px;">
                <thead>
                  <tr style="background-color:#f0f5ff;">
                    <th style="padding:10px 12px;font-size:12px;color:#1565C0;text-align:left;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Item</th>
                    <th style="padding:10px 12px;font-size:12px;color:#1565C0;text-align:center;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;width:60px;">Qty</th>
                    <th style="padding:10px 12px;font-size:12px;color:#1565C0;text-align:right;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;width:100px;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows}

                  <!-- SUBTOTAL -->
                  <tr>
                    <td colspan="2" style="padding:10px 12px;font-size:13px;color:#555;text-align:right;border-top:1px solid #eee;">Subtotal</td>
                    <td style="padding:10px 12px;font-size:13px;color:#333;text-align:right;border-top:1px solid #eee;white-space:nowrap;">${inr(itemsTotal)}</td>
                  </tr>

                  <!-- GST -->
                  ${gstAmount > 0 ? `
                  <tr>
                    <td colspan="2" style="padding:6px 12px;font-size:13px;color:#555;text-align:right;">GST</td>
                    <td style="padding:6px 12px;font-size:13px;color:#333;text-align:right;white-space:nowrap;">+${inr(gstAmount)}</td>
                  </tr>` : ''}

                  <!-- SHIPPING -->
                  <tr>
                    <td colspan="2" style="padding:6px 12px;font-size:13px;color:#555;text-align:right;">Shipping</td>
                    <td style="padding:6px 12px;font-size:13px;text-align:right;white-space:nowrap;${shippingCost === 0 ? 'color:#00A651;font-weight:600;' : 'color:#333;'}">
                      ${shippingCost === 0 ? 'FREE' : inr(shippingCost)}
                    </td>
                  </tr>

                  <!-- TOTAL -->
                  <tr style="background-color:#f0f5ff;">
                    <td colspan="2" style="padding:12px;font-size:14px;font-weight:700;color:#1565C0;text-align:right;">Total</td>
                    <td style="padding:12px;font-size:15px;font-weight:700;color:#1565C0;text-align:right;white-space:nowrap;">${inr(total)}</td>
                  </tr>
                </tbody>
              </table>

              <!-- CTA BUTTON -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                <tr>
                  <td align="center">
                    <a href="https://infixmart.com/my-orders"
                      style="display:inline-block;background-color:#1565C0;color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:13px 32px;border-radius:6px;letter-spacing:0.3px;">
                      View My Orders
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:20px 28px;border-top:1px solid #f0f0f0;background-color:#fafafa;">
              <p style="font-size:12px;color:#999;margin:0 0 4px;text-align:center;">
                If you have any questions, reply to this email or contact
                <a href="mailto:support@infixmart.com" style="color:#1565C0;text-decoration:none;">support@infixmart.com</a>
              </p>
              <p style="font-size:12px;color:#bbb;margin:0;text-align:center;">
                &copy; ${new Date().getFullYear()} InfixMart. Surat, Gujarat.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
};

const sendOrderEmail = async (order, user) => {
  const subject = `Order Confirmed! #${order.id} — InfixMart`;
  const text    = `Hi ${user?.name || 'Customer'}, your order #${order.id} has been confirmed. Total: ₹${order.totalPrice}. Visit https://infixmart.com/my-orders to track it.`;
  const html    = buildOrderEmailHtml(order, user);

  await sendEmail(user?.email, subject, text, html);
};

export default sendOrderEmail;
