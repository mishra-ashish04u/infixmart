import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { createUser, findUserByEmail, updateUserById } from "../lib/server/repositories/users.js";
import { getMysqlPool } from "../lib/server/db/mysql.js";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ quiet: true });

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME || "Admin";

async function run() {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in your environment before running this script.");
    process.exit(1);
  }

  const existing = await findUserByEmail(ADMIN_EMAIL);
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  if (existing) {
    await updateUserById(existing.id, {
      role: "admin",
      password: hash,
      verify_email: true,
      status: "active",
    });
    console.log("Admin account updated.");
  } else {
    await createUser({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: hash,
      role: "admin",
      verify_email: true,
      status: "active",
    });
    console.log("Admin account created.");
  }

  console.log(`Email: ${ADMIN_EMAIL}`);
  await getMysqlPool().end();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
