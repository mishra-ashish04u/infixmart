import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import helmet, { crossOriginResourcePolicy } from "helmet";
import morgan from "morgan";
import connectDB from "./config/connectDB.js";

import userRoute from "./route/userRoute.js";
import categoryRouter from "./route/categoryRoute.js";
import productRouter from "./route/productRoute.js";
import cartRouter from "./route/cartRoute.js";
import myListRouter from "./route/myListRoute.js";
import addressRouter from "./route/addressRoute.js";
import productRamRouter from "./route/productRamRoute.js";
import productWeightRouter from "./route/productWeightRoute.js";
import productSizeRouter from "./route/productSizeRoute.js";
import homeSlideRouter from "./route/homeSlideRoute.js";

const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
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
// app.options(/.*/, cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(morgan());

app.get("/", (req, res) => {
  res.json({
    message: "Server is running" + ' ' + process.env.PORT,
  });
});

app.use("/api/user", userRoute);
app.use("/api/category", categoryRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/mylist", myListRouter);
app.use("/api/address", addressRouter);
app.use("/api/productRam", productRamRouter);
app.use("/api/productWeight", productWeightRouter);
app.use("/api/productSize", productSizeRouter);
app.use("/api/homeSlide", homeSlideRouter);

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
});
