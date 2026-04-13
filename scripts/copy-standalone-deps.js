// Copies runtime packages into the standalone output so deployments using
// Next.js standalone mode still have access to dependencies that may be loaded
// outside the main traced entrypoint.
import fs from "fs";
import path from "path";

const standaloneModules = path.resolve(".next/standalone/node_modules");
const standaloneRoot = path.resolve(".next/standalone");

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
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true, force: true });
}

for (const pkg of PACKAGES) {
  const src = path.resolve("node_modules", pkg);
  const dest = path.join(standaloneModules, pkg);
  copyDir(src, dest);
  console.log(`Copied: ${pkg}`);
}

copyDir(path.resolve(".next/static"), path.join(standaloneRoot, ".next/static"));
console.log("Copied: .next/static");

copyDir(path.resolve("public"), path.join(standaloneRoot, "public"));
console.log("Copied: public");

console.log("Standalone assets and deps copy complete.");
