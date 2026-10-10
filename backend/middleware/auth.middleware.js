import jwt from "jsonwebtoken";
import { verifyUserToken } from "../services/token.service.js";

const unauthorized = (res, message) => res.status(401).json({ success: false, message });

/** Verifies the bearer token and rejects banned or deleted accounts. */
export const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) return unauthorized(res, "Unauthorized: No token provided");
    const token = header.slice(7).trim();
    if (!token) return unauthorized(res, "Unauthorized: No token provided");

    const payload = verifyUserToken(token);
    const { users, bans } = req.app.locals.repos;
    const user = await users.findById(payload.userId);
    if (!user) return unauthorized(res, "Unauthorized: account no longer exists");

    const ban = await bans.findByUserId(user.id);
    if (ban) {
      if (ban.bannedUntil && new Date() > new Date(ban.bannedUntil)) await bans.deleteByUserId(user.id);
      else return res.status(403).json({ success: false, message: "Your account has been banned" });
    }

    // Trust the database for the role, not the token.
    req.user = { userId: user.id, username: user.name, email: user.email, role: user.role };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return unauthorized(res, "Unauthorized: Invalid or expired token");
    }
    console.error("Auth middleware error:", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const requireRole =
  (...roles) =>
  (req, res, next) =>
    roles.includes(req.user?.role)
      ? next()
      : res.status(403).json({ success: false, message: `Requires ${roles.join(" or ")} access` });
