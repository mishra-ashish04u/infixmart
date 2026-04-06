import { Router } from 'express';
import auth from '../middleware/auth.js';
import { createRazorpayOrder, verifyRazorpayPayment } from '../controllers/paymentController.js';

const paymentRouter = Router();

paymentRouter.post('/create-order', auth, createRazorpayOrder);
paymentRouter.post('/verify', auth, verifyRazorpayPayment);

export default paymentRouter;
