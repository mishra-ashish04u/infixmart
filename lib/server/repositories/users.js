import { execute, query } from "../db/mysql.js";

const USER_SELECT = `
  id,
  name,
  email,
  password,
  avatar,
  mobile,
  country,
  accessToken,
  refreshToken,
  verify_email,
  last_login_date,
  status,
  otp,
  otp_expires,
  google_id,
  role,
  is_member,
  membership_started_at,
  rto_count,
  referralCode,
  referredBy,
  walletBalance,
  createdAt,
  updatedAt
`;

const USER_UPDATE_COLUMNS = new Set([
  "name",
  "email",
  "password",
  "avatar",
  "mobile",
  "country",
  "accessToken",
  "refreshToken",
  "verify_email",
  "last_login_date",
  "status",
  "otp",
  "otp_expires",
  "google_id",
  "role",
  "is_member",
  "membership_started_at",
  "rto_count",
  "referralCode",
  "referredBy",
  "walletBalance",
]);

function mapUserRow(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    _id: row.id,
    verify_email: Boolean(row.verify_email),
    is_member: Boolean(row.is_member),
    rto_count: Number(row.rto_count || 0),
    walletBalance: Number(row.walletBalance || 0),
    referralCode: row.referralCode || null,
    referredBy: row.referredBy || null,
  };
}

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  const { password, refreshToken, otp, otp_expires, ...safeUser } = user;
  return safeUser;
}

async function findUserByEmail(email) {
  const rows = await query(
    `SELECT ${USER_SELECT} FROM Users WHERE email = :email LIMIT 1`,
    { email }
  );

  return mapUserRow(rows[0]);
}

async function findUserById(id) {
  const rows = await query(
    `SELECT ${USER_SELECT} FROM Users WHERE id = :id LIMIT 1`,
    { id }
  );

  return mapUserRow(rows[0]);
}

async function findUserByReferralCode(referralCode) {
  const rows = await query(
    `SELECT ${USER_SELECT} FROM Users WHERE referralCode = :referralCode LIMIT 1`,
    { referralCode }
  );
  return mapUserRow(rows[0]);
}

async function creditWallet(userId, amount, conn) {
  const run = conn
    ? (sql, p) => conn.execute(sql, p).then(([r]) => r)
    : (sql, p) => execute(sql, p);
  await run(
    `UPDATE Users SET walletBalance = walletBalance + :amount, updatedAt = NOW() WHERE id = :userId`,
    { userId, amount }
  );
}

async function findUserByRefreshToken(refreshToken) {
  const rows = await query(
    `SELECT ${USER_SELECT} FROM Users WHERE refreshToken = :refreshToken LIMIT 1`,
    { refreshToken }
  );

  return mapUserRow(rows[0]);
}

async function createUser({
  name,
  email,
  password,
  avatar = "",
  mobile = null,
  country = "",
  accessToken = "",
  refreshToken = "",
  verify_email = false,
  last_login_date = null,
  status = "active",
  otp = null,
  otp_expires = null,
  google_id = null,
  role = "user",
  referralCode = null,
  referredBy = null,
}) {
  const result = await execute(
    `INSERT INTO Users (
      name,
      email,
      password,
      avatar,
      mobile,
      country,
      accessToken,
      refreshToken,
      verify_email,
      last_login_date,
      status,
      otp,
      otp_expires,
      google_id,
      role,
      referralCode,
      referredBy,
      createdAt,
      updatedAt
    ) VALUES (
      :name,
      :email,
      :password,
      :avatar,
      :mobile,
      :country,
      :accessToken,
      :refreshToken,
      :verify_email,
      :last_login_date,
      :status,
      :otp,
      :otp_expires,
      :google_id,
      :role,
      :referralCode,
      :referredBy,
      NOW(),
      NOW()
    )`,
    {
      name,
      email,
      password,
      avatar,
      mobile,
      country,
      accessToken,
      refreshToken,
      verify_email,
      last_login_date,
      status,
      otp,
      otp_expires,
      google_id,
      role,
      referralCode,
      referredBy,
    }
  );

  if (!result || result.insertId == null) {
    console.error("[createUser] INSERT returned unexpected result:", result);
    throw new Error("Failed to create user: no insertId returned");
  }

  return findUserById(result.insertId);
}

async function updateUserById(id, updates) {
  const entries = Object.entries(updates).filter(
    ([key, value]) => USER_UPDATE_COLUMNS.has(key) && value !== undefined
  );

  if (entries.length === 0) {
    return findUserById(id);
  }

  const setClause = entries
    .map(([key]) => `\`${key}\` = :${key}`)
    .join(", ");

  const params = Object.fromEntries(entries);

  await execute(
    `UPDATE Users SET ${setClause}, updatedAt = NOW() WHERE id = :id`,
    { ...params, id }
  );

  return findUserById(id);
}

export {
  createUser,
  creditWallet,
  findUserByEmail,
  findUserById,
  findUserByReferralCode,
  findUserByRefreshToken,
  sanitizeUser,
  updateUserById,
};
