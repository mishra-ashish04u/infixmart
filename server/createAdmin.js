import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

import connectDB, { sequelize } from "./config/connectDB.js";
import User from "./models/User.js";

// OWASP A07: never hardcode credentials — provide via env vars
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME     = process.env.ADMIN_NAME || "Admin";

const run = async () => {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("❌  Set ADMIN_EMAIL and ADMIN_PASSWORD in your .env before running this script.");
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ where: { email: ADMIN_EMAIL } });

  if (existing) {
    // Already exists — promote to admin and reset password
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await existing.update({ role: "admin", password: hash, verify_email: true, status: "active" });
    console.log("✅ Admin account updated.");
  } else {
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await User.create({
      name:         ADMIN_NAME,
      email:        ADMIN_EMAIL,
      password:     hash,
      role:         "admin",
      verify_email: true,
      status:       "active",
    });
    console.log("✅ Admin account created.");
  }

  console.log(`   Email   : ${ADMIN_EMAIL}`);
  // OWASP A07: never log credentials to stdout

  await sequelize.close();
};

run().catch((err) => { console.error(err); process.exit(1); });
