import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import connectDB from "./config/connectDB.js";

// Import all models to register them with Sequelize before sync
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
import "./models/associations.js"; // defines Order ↔ OrderItem FK relationship
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

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_WWW,
].filter(Boolean);

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

// OWASP A05: Helmet with HSTS + CSP + other security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // allow /uploads images cross-origin
    hsts: {
      maxAge: 31536000,      // 1 year
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

// OWASP A09: log in dev (verbose) and production (combined → stdout for log aggregation)
if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}

// ── Rate limiters ─────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again later", error: true, success: false },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later", error: true, success: false },
});

// OWASP A01: payment endpoints need stricter limits to prevent abuse/enumeration
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many payment requests, please try again later", error: true, success: false },
});

// Serve uploaded images as static files
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    dotfiles: "ignore",
    index: false,
    maxAge: "7d",
  })
);

app.get("/", (req, res) => {
  res.json({ message: "InfixMart API is running" });
});

// ── Health check ──────────────────────────────────────────────────────────────
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

// ── SEO Sitemap ───────────────────────────────────────────────────────────────
app.use("/", sitemapRouter);

// ── Public settings endpoint (cached 60 s) ────────────────────────────────────
app.get("/api/settings", getSettingsPublic);

// ── Public coupon apply endpoint ──────────────────────────────────────────────
app.post("/api/coupon/apply", applyCoupon);

// ── Global error handler (prevents leaking stack traces) ─────────────────────
app.use((err, req, res, next) => {
  console.error("[ERROR]", req.method, req.path, err);
  const status = err.status || err.statusCode || 500;
  const message = status < 500 ? err.message : "Internal server error";
  res.status(status).json({ message, error: true, success: false });
});

connectDB().then(async () => {
  await seedSettings();
  await seedHomePageContent();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
