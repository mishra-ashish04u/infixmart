import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config({ quiet: true });
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/connectDB.js";
import { ensureUploadsDir, uploadsDir } from "./config/uploads.js";

import "./models/User.js";
import "./models/Category.js";
import "./models/Product.js";
import "./models/CartProduct.js";
import "./models/Order.js";
import "./models/OrderItem.js";
import "./models/Address.js";
import "./models/MyList.js";
import "./models/HomeSlide.js";
import "./models/ProductRam.js";
import "./models/ProductSize.js";
import "./models/ProductWeight.js";
import "./models/associations.js";
import "./models/AttributeType.js";
import "./models/AttributeValue.js";
import "./models/StoreSettings.js";
import "./models/Blog.js";
import "./models/Coupon.js";
import "./models/HomePageContent.js";
import "./models/Review.js";
import "./models/Return.js";

import userRoute from "./route/userRoute.js";
import categoryRouter from "./route/categoryRoute.js";
import productRouter from "./route/productRoute.js";
import cartRouter from "./route/cartRoute.js";
import myListRouter from "./route/myListRoute.js";
import productRamRouter from "./route/productRamRoute.js";
import productWeightRouter from "./route/productWeightRoute.js";
import productSizeRouter from "./route/productSizeRoute.js";
import homeSlideRouter from "./route/homeSlideRoute.js";
import orderRouter from "./route/orderRoute.js";
import adminRouter from "./route/adminRoute.js";
import userAddressRouter from "./route/userAddressRoute.js";
import paymentRouter from "./route/paymentRoute.js";
import attributeRouter from "./route/attributeRoute.js";
import blogRouter from "./route/blogRoute.js";
import { getSettingsPublic } from "./controllers/settingsController.js";
import { seedSettings } from "./models/StoreSettings.js";
import couponAdminRouter from "./route/couponRoute.js";
import homePageRouter from "./route/homePageRoute.js";
import reviewRouter from "./route/reviewRoute.js";
import returnRouter from "./route/returnRoute.js";
import { applyCoupon } from "./controllers/couponController.js";
import { seedHomePageContent } from "./models/HomePageContent.js";
import sitemapRouter from "./route/sitemapRoute.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

ensureUploadsDir();

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);

const allowedOrigins = [
  // Local development
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5174",
  // Production — set FRONTEND_URL and FRONTEND_URL_WWW in your .env
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_WWW,
  // Also allow the same-origin (Next.js API routes call Express internally)
  process.env.NEXT_PUBLIC_SITE_URL,
].filter(Boolean).filter((v, i, arr) => arr.indexOf(v) === i); // deduplicate

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://checkout.razorpay.com", "https://cdn.jsdelivr.net", "https://accounts.google.com"],
        frameSrc: ["'self'", "https://api.razorpay.com", "https://accounts.google.com"],
        connectSrc: ["'self'", "https://api.razorpay.com", "https://lumberjack.razorpay.com", "https://www.googleapis.com", "https://accounts.google.com"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    noSniff: true,
    frameguard: { action: "deny" },
  })
);

if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
}

// Extract first valid IP from x-forwarded-for (handles IPv6 and comma-separated lists)
function extractClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"] || req.ip || "127.0.0.1";
  const firstIp = String(forwarded).split(",")[0].trim();
  return firstIp || "127.0.0.1";
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: extractClientIp,
  message: { message: "Too many attempts, please try again later", error: true, success: false },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: extractClientIp,
  message: { message: "Too many requests, please try again later", error: true, success: false },
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: extractClientIp,
  message: { message: "Too many payment requests, please try again later", error: true, success: false },
});

app.use(
  "/uploads",
  express.static(uploadsDir, {
    dotfiles: "ignore",
    index: false,
    maxAge: "7d",
  })
);

app.get("/", (req, res) => {
  res.json({ message: "InfixMart API is running" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", apiLimiter);
app.use("/api/user/register", authLimiter);
app.use("/api/user/login", authLimiter);
app.use("/api/user/forgot-password", authLimiter);
app.use("/api/admin/login", authLimiter);
app.use("/api/user", userRoute);
app.use("/api/category", categoryRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/mylist", myListRouter);
app.use("/api/productRam", productRamRouter);
app.use("/api/productWeight", productWeightRouter);
app.use("/api/productSize", productSizeRouter);
app.use("/api/homeSlide", homeSlideRouter);
app.use("/api/order", orderRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user/addresses", userAddressRouter);
app.use("/api/payment", paymentLimiter, paymentRouter);
app.use("/api/admin/attributes", attributeRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/returns", returnRouter);
app.use("/api/blog", blogRouter);
app.use("/api/admin/coupons", couponAdminRouter);
app.use("/api/admin/homepage", homePageRouter);
app.use("/api/homepage", homePageRouter);
app.use("/", sitemapRouter);
app.get("/api/settings", getSettingsPublic);
app.post("/api/coupon/apply", applyCoupon);

app.use((err, req, res, next) => {
  console.error("[ERROR]", req.method, req.path, err);
  const status = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message : "Internal server error";
  res.status(status).json({ message, error: true, success: false });
});

let serverReadyPromise;

const initializeServer = async () => {
  if (!serverReadyPromise) {
    serverReadyPromise = (async () => {
      await connectDB();
      await seedSettings();
      await seedHomePageContent();
      return app;
    })();
  }

  return serverReadyPromise;
};

export { initializeServer, uploadsDir };
export default app;
