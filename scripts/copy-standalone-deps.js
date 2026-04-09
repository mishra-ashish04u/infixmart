// Copies runtime packages into the standalone output so deployments using
// Next.js standalone mode still have access to dependencies that may be loaded
// outside the main traced entrypoint.
import fs from "fs";
import path from "path";

const standaloneModules = path.resolve(".next/standalone/node_modules");

// Skip if not a standalone build
if (!fs.existsSync(standaloneModules)) {
  console.log("No standalone output found, skipping dep copy.");
  process.exit(0);
}

const PACKAGES = [
  "mysql2",
  "nodemailer",
  "razorpay",
  "sharp",
  "bcryptjs",
  "jsonwebtoken",
];

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  if (fs.existsSync(dest)) return; // already there
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

for (const pkg of PACKAGES) {
  const src = path.resolve("node_modules", pkg);
  const dest = path.join(standaloneModules, pkg);
  copyDir(src, dest);
  console.log(`Copied: ${pkg}`);
}

console.log("Standalone deps copy complete.");
