import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import sendEmailFun from "../config/sendEmail.js";
import VerificationEmail from "../utils/verifyEmailTemplate.js";
import generateAccessToken from "../utils/generateAccessToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";
import fs from "fs";
import path from "path";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// OWASP A07: min 8 chars, at least one letter, one digit, one special char
const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&^_\-])[A-Za-z\d@$!%*#?&^_\-]{8,}$/;

// OWASP A02: never store OTP plaintext — always hash/compare with bcrypt
const hashOtp   = async (otp) => bcrypt.hash(otp, 10);
const verifyOtp = async (plain, hashed) => {
  if (!plain || !hashed) return false;
  return bcrypt.compare(plain, hashed);
};

export const registerUserController = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required", error: true, success: false });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: "Invalid email address", error: true, success: false });
    }
    if (!PASSWORD_RE.test(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters and include a letter, a number, and a special character (@$!%*#?&^_-)",
        error: true, success: false,
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists", error: true, success: false });
    }

    const verifycode = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    await User.create({
      name,
      email,
      password: hashPassword,
      otp: await hashOtp(verifycode),
      otp_expires: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendEmailFun(email, "Verify your email", "", VerificationEmail(name, verifycode));

    return res.status(200).json({
      success: true,
      error: false,
      message: "User registered successfully. Please check your email to verify your account.",
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const verifyEmailController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "User Not Found!", error: true, success: false });
    }

    const isCodeValid = await verifyOtp(otp, user.otp);
    const isNotExpired = new Date(user.otp_expires) > new Date();

    if (isCodeValid && isNotExpired) {
      user.verify_email = true;
      user.otp = null;
      user.otp_expires = null;
      await user.save();
      return res.status(200).json({ message: "Email verified successfully", success: true, error: false });
    } else if (!isCodeValid) {
      return res.status(400).json({ message: "Invalid OTP", error: true, success: false });
    } else {
      return res.status(400).json({ message: "OTP Expired", error: true, success: false });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const loginUserController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "User Not Found!", error: true, success: false });
    }

    if (user.status !== "active") {
      return res.status(400).json({
        message: `Your account is ${user.status}. Please contact support.`,
        error: true,
        success: false,
      });
    }

    if (!user.verify_email) {
      return res.status(400).json({
        message: "Your email is not verified. Please verify your email to login.",
        error: true,
        success: false,
      });
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(400).json({ message: "Invalid Credentials", error: true, success: false });
    }

    const accessToken = await generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);

    await User.update({ last_login_date: new Date() }, { where: { id: user.id } });

    // Persistent cookies — survive browser close/restart
    // Access token matches its own JWT expiry (15 min)
    // Refresh token matches its JWT expiry (7 days) — auto-renews the session silently
    res.cookie("accessToken", accessToken, {
      httpOnly: true, secure: true, sameSite: "None",
      maxAge: 15 * 60 * 1000,             // 15 minutes
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, secure: true, sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,   // 7 days
    });

    // OWASP A02/A07: tokens live in httpOnly cookies only — never returned in body
    return res.status(200).json({
      message: "Login Successful",
      success: true,
      error: false,
      data: { user },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const logoutUserController = async (req, res) => {
  try {
    const userid = req.userId;

    const cookiesOption = { httpOnly: true, secure: true, sameSite: "None" };
    res.clearCookie("accessToken", cookiesOption);
    res.clearCookie("refreshToken", cookiesOption);

    await User.update({ refreshToken: "" }, { where: { id: userid } });

    return res.status(200).json({ message: "Logout Successful", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const userAvatarController = async (req, res) => {
  try {
    const userid = req.userId;

    const user = await User.findByPk(userid);
    if (!user) {
      return res.status(404).json({ message: "User not found", error: true, success: false });
    }

    // Delete old avatar safely — safeUnlink strips any path traversal
    if (user.avatar && user.avatar.startsWith("/uploads/")) {
      safeUnlink(user.avatar.replace("/uploads/", ""));
    }

    const avatarUrl = `/uploads/${req.files[0].filename}`;
    user.avatar = avatarUrl;
    await user.save();

    return res.status(200).json({
      _id: userid,
      avatar: avatarUrl,
      message: "Image uploaded successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

// OWASP A01/A03: sanitize filename — strip any path components to prevent traversal
const safeUnlink = (filename) => {
  if (!filename) return;
  // path.basename strips any directory traversal (../../etc/passwd → passwd)
  const safe = path.basename(filename);
  if (!safe || safe === "." || safe === "..") return;
  try { fs.unlinkSync(path.join("uploads", safe)); } catch (_) {}
};

export const deleteImage = async (req, res) => {
  try {
    const imgPath = req.query.img;
    if (!imgPath) return res.status(400).json({ message: "img query param required", error: true, success: false });
    // Only allow deleting files that start with /uploads/
    if (!imgPath.startsWith("/uploads/")) {
      return res.status(400).json({ message: "Invalid path", error: true, success: false });
    }
    safeUnlink(imgPath.replace("/uploads/", ""));
    return res.status(200).json({ result: "ok" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const updateUserDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, email, mobile, country, password } = req.body;

    const userExist = await User.findByPk(userId);
    if (!userExist) {
      return res.status(404).json({ message: "User not found", error: true, success: false });
    }

    let verifyCode = "";
    let hashedOtp = null;
    if (email && email !== userExist.email) {
      verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
      hashedOtp = await hashOtp(verifyCode);
    }

    let hashPassword = userExist.password;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashPassword = await bcrypt.hash(password, salt);
    }

    await User.update(
      {
        name,
        email,
        verify_email: verifyCode !== "" ? false : userExist.verify_email,
        mobile,
        country,
        password: hashPassword,
        otp: hashedOtp,
        otp_expires: verifyCode !== "" ? new Date(Date.now() + 10 * 60 * 1000) : null,
      },
      { where: { id: userId } }
    );

    if (verifyCode !== "") {
      await sendEmailFun(email, "Verify your email", "", VerificationEmail(name, verifyCode));
    }

    const updateUser = await User.findByPk(userId);

    return res.status(200).json({
      message: "User details updated successfully",
      success: true,
      error: false,
      user: {
        name: updateUser.name,
        _id: updateUser.id,
        email: updateUser.email,
        mobile: updateUser.mobile,
        country: updateUser.country,
        avatar: updateUser.avatar,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "User Not Found!", error: true, success: false });
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = await hashOtp(verifyCode);
    user.otp_expires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmailFun(email, "Verify your email", "", VerificationEmail(user.name, verifyCode));

    return res.status(200).json({
      message: "Please check your email to reset your password.",
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const verifyForgotPasswordOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required", error: true, success: false });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "User Not Found!", error: true, success: false });
    }

    if (!(await verifyOtp(otp, user.otp))) {
      return res.status(400).json({ message: "Invalid OTP", error: true, success: false });
    }

    if (new Date(user.otp_expires) < new Date()) {
      return res.status(400).json({ message: "OTP Expired", error: true, success: false });
    }

    user.otp = null;
    user.otp_expires = null;
    await user.save();

    return res.status(200).json({ message: "OTP verified successfully", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    const { email, oldPassword, newPassword, confirmPassword } = req.body;
    if (!email || !oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "Email, Old Password, New Password and Confirm Password are required",
        error: true,
        success: false,
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "User Not Found!", error: true, success: false });
    }

    const checkPassword = await bcrypt.compare(oldPassword, user.password);
    if (!checkPassword) {
      return res.status(400).json({ message: "Invalid Old Password", error: true, success: false });
    }

    if (!PASSWORD_RE.test(newPassword)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters and include a letter, a number, and a special character",
        error: true, success: false,
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New Password and Confirm Password do not match", error: true, success: false });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({ message: "Password reset successfully", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const refreshTokenController = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken || req?.headers?.authorization?.split(" ")[1];
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided", error: true, success: false });
    }

    let verifyToken;
    try {
      verifyToken = jwt.verify(refreshToken, process.env.JWT_SECRET_REFRESH_TOKEN);
    } catch {
      return res.status(403).json({ message: "Invalid refresh token", error: true, success: false });
    }

    // OWASP A07: validate token matches the one stored in DB (prevents reuse after logout)
    const user = await User.findByPk(verifyToken.id, { attributes: ["id", "refreshToken"] });
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Refresh token revoked", error: true, success: false });
    }

    const newAccessToken = await generateAccessToken(verifyToken.id);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true, secure: true, sameSite: "None",
      maxAge: 15 * 60 * 1000, // 15 minutes — persistent across browser restarts
    });

    return res.status(200).json({
      message: "New Access Token generated",
      error: false,
      success: true,
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const userDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["password", "refreshToken", "otp", "otp_expires"] },
    });
    return res.status(200).json({ message: "User details fetched successfully", success: true, error: false, user });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const googleLoginController = async (req, res) => {
  try {
    const { access_token } = req.body;
    if (!access_token) {
      return res.status(400).json({ message: "Google access token required", error: true, success: false });
    }

    // Verify token and fetch user info from Google
    const googleRes = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`);
    if (!googleRes.ok) {
      return res.status(401).json({ message: "Invalid Google token", error: true, success: false });
    }
    const googleData = await googleRes.json();
    const { email, name, picture, id: googleId } = googleData;

    if (!email) {
      return res.status(401).json({ message: "Could not retrieve email from Google", error: true, success: false });
    }

    let user = await User.findOne({ where: { email } });

    if (!user) {
      // New user — create with a random unhashed password (they will always use Google to log in)
      const randomPassword = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        password: randomPassword,
        avatar: picture || "",
        verify_email: true,
        google_id: googleId,
        status: "active",
      });
    } else {
      if (user.status !== "active") {
        return res.status(400).json({
          message: `Your account is ${user.status}. Please contact support.`,
          error: true, success: false,
        });
      }
      // Link Google ID to existing account if not already linked
      if (!user.google_id) {
        await User.update({ google_id: googleId, verify_email: true }, { where: { id: user.id } });
      }
    }

    const accessToken = await generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);
    await User.update({ last_login_date: new Date() }, { where: { id: user.id } });

    res.cookie("accessToken", accessToken, {
      httpOnly: true, secure: true, sameSite: "None",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, secure: true, sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const freshUser = await User.findByPk(user.id, {
      attributes: { exclude: ["password", "refreshToken", "otp", "otp_expires"] },
    });

    return res.status(200).json({
      message: "Login Successful",
      success: true,
      error: false,
      data: { user: freshUser },
    });
  } catch (error) {
    console.error("Google login error:", error);
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};

export const resendVerificationOtpController = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required", error: true, success: false });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "User Not Found!", error: true, success: false });
    }

    if (user.verify_email) {
      return res.status(400).json({ message: "Email is already verified", error: true, success: false });
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = await hashOtp(verifyCode);
    user.otp_expires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmailFun(email, "Verify your email", "", VerificationEmail(user.name, verifyCode));

    return res.status(200).json({ message: "Verification OTP resent successfully", success: true, error: false });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error: true, success: false });
  }
};
