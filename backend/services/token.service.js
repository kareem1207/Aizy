import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const signUserToken = (user) =>
  jwt.sign({ userId: user.id, username: user.name, email: user.email, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

export const verifyUserToken = (token) => {
  const payload = jwt.verify(token, env.jwtSecret);
  if (payload.purpose) throw new jwt.JsonWebTokenError("wrong token type");
  return payload;
};

/** Proof that an email address was verified by OTP; required to register. */
export const signEmailProof = (email) => jwt.sign({ purpose: "email-proof", email }, env.jwtSecret, { expiresIn: "15m" });

export const checkEmailProof = (proof, email) => {
  try {
    const p = jwt.verify(proof, env.jwtSecret);
    return p.purpose === "email-proof" && p.email === email;
  } catch {
    return false;
  }
};
