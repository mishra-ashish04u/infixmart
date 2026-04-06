import Razorpay from 'razorpay';
import crypto from 'crypto';

export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: true, message: 'Invalid amount' });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // convert ₹ to paise
      currency: 'INR',
      receipt: 'receipt_' + Date.now(),
    });

    // OWASP A05: never return server-side secrets in API response.
    // Frontend reads VITE_RAZORPAY_KEY_ID from its own .env at build time.
    return res.status(200).json({
      error: false,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("[Payment] createOrder error:", error);
    return res.status(500).json({ error: true, message: "Internal server error" });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment verification fields' });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    return res.status(200).json({ success: true, paymentId: razorpay_payment_id });
  } catch (error) {
    console.error("[Payment] verifyPayment error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
