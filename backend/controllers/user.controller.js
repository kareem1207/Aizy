import argon2 from "argon2";
import { env } from "../config/env.js";
import { issueOtp, checkOtp } from "../services/otp.service.js";
import { sendOtpMail } from "../services/mail.service.js";
import { checkEmailProof, signEmailProof, signUserToken } from "../services/token.service.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;
const MAX_IMAGE = 5 * 1024 * 1024;

const fail = (res, status, message, extra = {}) => res.status(status).json({ success: false, message, ...extra });
const str = (v, max) => String(v ?? "").trim().slice(0, max);
const publicUser = ({ password, ...rest }) => rest;

// Runs a hash even when the account is unknown so response time does not reveal which emails exist.
const DUMMY_HASH_PROMISE = argon2.hash("not-a-real-password");

export const createUser = async (req, res) => {
  try {
    const { users } = req.app.locals.repos;
    const name = str(req.body.name, 80);
    const email = str(req.body.email, 254).toLowerCase();
    const role = req.body.role || "customer";
    const password = String(req.body.password ?? "");

    if (!name || !email || !password) return fail(res, 400, "Please provide all required fields");
    if (!EMAIL_RE.test(email)) return fail(res, 400, "Invalid email format");
    if (!["customer", "seller"].includes(role)) return fail(res, 400, "Invalid role");
    if (password.length < MIN_PASSWORD) return fail(res, 400, `Password must be at least ${MIN_PASSWORD} characters`);
    if (!checkEmailProof(req.body.proof, email)) return fail(res, 400, "Please verify your email first");

    if (await users.findByEmailRole(email, role)) return fail(res, 400, "User with this email already exists");

    const user = await users.create({ name, email, password: await argon2.hash(password), role });
    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: publicUser(user),
      token: signUserToken(user),
    });
  } catch (error) {
    console.error("Server error during user creation:", error.message);
    return fail(res, 500, "Server error during user creation");
  }
};

export const getUser = async (req, res) => {
  try {
    const { users, bans } = req.app.locals.repos;
    const email = str(req.body.email, 254).toLowerCase();
    const password = String(req.body.password ?? "");
    const role = req.body.role;
    if (!email || !password) return fail(res, 400, "Email and password are required");

    const found = role ? await users.findByEmailRole(email, role) : (await users.findByEmail(email))[0];
    const valid = found
      ? await argon2.verify(found.password, password)
      : (await argon2.verify(await DUMMY_HASH_PROMISE, password), false);
    if (!found || !valid) return fail(res, 401, "Invalid email or password");

    const ban = await bans.findByUserId(found.id);
    if (ban) {
      if (ban.bannedUntil && new Date() > new Date(ban.bannedUntil)) await bans.deleteByUserId(found.id);
      else return fail(res, 403, "Your account has been banned", { reason: ban.reason, bannedUntil: ban.bannedUntil });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: publicUser(found),
      token: signUserToken(found),
    });
  } catch (error) {
    console.error("Server error during login:", error.message);
    return fail(res, 500, "Server error during login");
  }
};

export const generateOTP = async (req, res) => {
  const email = str(req.body.email, 254).toLowerCase();
  if (!EMAIL_RE.test(email)) return fail(res, 400, "A valid email is required");

  const issued = issueOtp(email);
  if (issued.error) return fail(res, 429, `Please wait ${issued.retryInSeconds}s before requesting another code`);

  const mail = await sendOtpMail(email, issued.code);
  if (mail.delivered) return res.status(200).json({ success: true, message: "Verification code sent" });

  // No mail provider configured: only ever echo the code outside production, for local development.
  if (!env.isProd) {
    console.warn(`[dev] OTP for ${email}: ${issued.code} (email not sent: ${mail.reason})`);
    return res.status(200).json({ success: true, message: "Email is not configured; code returned for development", devOtp: issued.code });
  }
  return fail(res, 503, "Could not send the verification email. Please try again later.");
};

export const verifyOTP = async (req, res) => {
  const email = str(req.body.email, 254).toLowerCase();
  const otp = str(req.body.otp, 12);
  if (!EMAIL_RE.test(email) || !otp) return fail(res, 400, "Email and code are required");

  const result = checkOtp(email, otp);
  if (result.error === "expired") return fail(res, 400, "Code expired. Please request a new one.");
  if (result.error === "locked") return fail(res, 429, "Too many attempts. Please request a new code.");
  if (result.error) return fail(res, 400, "Invalid OTP!");
  return res.status(200).json({ success: true, message: "OTP verified", proof: signEmailProof(email) });
};

export const getUsers = async (req, res) => {
  try {
    const list = await req.app.locals.repos.users.list();
    return res.status(200).json({ success: true, data: list });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    return fail(res, 500, "Server Error while fetching users");
  }
};

export const banUser = async (req, res) => {
  try {
    const { users, bans } = req.app.locals.repos;
    const userId = Number(req.body.userId);
    if (!userId) return fail(res, 400, "User ID is required");

    const user = await users.findById(userId);
    if (!user) return fail(res, 404, "User not found");
    if (user.role === "admin") return fail(res, 400, "Admins cannot be banned");
    if (await bans.findByUserId(userId)) return fail(res, 400, "User is already banned");

    let bannedUntil = null;
    const days = parseInt(req.body.banDuration, 10);
    if (days > 0) bannedUntil = new Date(Date.now() + days * 86400000);

    const ban = await bans.create({
      userId: user.id,
      email: user.email,
      name: user.name,
      reason: str(req.body.reason, 200) || "Violation of terms of service",
      bannedUntil,
    });
    return res.status(200).json({ success: true, message: "User banned successfully", data: ban });
  } catch (error) {
    console.error("Error banning user:", error.message);
    return fail(res, 500, "Server error while banning user");
  }
};

export const unbanUser = async (req, res) => {
  try {
    const userId = Number(req.body.userId);
    if (!userId) return fail(res, 400, "User ID is required");
    const removed = await req.app.locals.repos.bans.deleteByUserId(userId);
    if (!removed) return fail(res, 400, "This user is not banned");
    return res.status(200).json({ success: true, message: "User unbanned successfully" });
  } catch (error) {
    console.error("Error unbanning user:", error.message);
    return fail(res, 500, "Server error while unbanning user");
  }
};

export const getBannedUsers = async (req, res) => {
  try {
    return res.status(200).json({ success: true, data: await req.app.locals.repos.bans.list() });
  } catch (error) {
    console.error("Error fetching banned users:", error.message);
    return fail(res, 500, "Server error while fetching banned users");
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { users } = req.app.locals.repos;
    const name = str(req.body.name, 80);
    const email = str(req.body.email, 254).toLowerCase();
    const password = String(req.body.password ?? "");
    if (!name || !email || !password) return fail(res, 400, "All fields are required");
    if (req.body.adminId !== undefined && Number(req.body.adminId) !== req.user.userId)
      return fail(res, 403, "Admin ID does not match the signed-in admin");
    if (!EMAIL_RE.test(email)) return fail(res, 400, "Invalid email format");
    if (password.length < MIN_PASSWORD) return fail(res, 400, `Password must be at least ${MIN_PASSWORD} characters`);
    if (await users.findByEmailRole(email, "admin")) return fail(res, 400, "An admin with this email already exists");

    const admin = await users.create({ name, email, password: await argon2.hash(password), role: "admin" });
    return res.status(201).json({ success: true, message: "Admin created successfully", data: publicUser(admin) });
  } catch (error) {
    console.error("Error creating admin:", error.message);
    return fail(res, 500, "Server Error during admin creation");
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { users } = req.app.locals.repos;
    const picture = req.body.profilePicture;
    if (picture !== undefined && (typeof picture !== "string" || !picture.startsWith("data:image/")))
      return fail(res, 400, "Profile picture must be an image");
    if (picture && picture.length > MAX_IMAGE)
      return fail(res, 400, "Profile picture is too large. Please upload an image smaller than 5MB.");

    const updated = await users.update(req.user.userId, picture ? { profilePicture: picture } : {});
    if (!updated) return fail(res, 404, "User not found");
    return res.status(200).json({ success: true, message: "Profile updated successfully", data: publicUser(updated) });
  } catch (error) {
    console.error("Error updating profile:", error.message);
    return fail(res, 500, "Server error while updating profile");
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await req.app.locals.repos.users.findById(req.user.userId);
    if (!user) return fail(res, 404, "User not found");
    return res.status(200).json({ success: true, data: publicUser(user) });
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    return fail(res, 500, "Server error while fetching profile");
  }
};
