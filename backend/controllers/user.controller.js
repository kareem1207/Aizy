import { prisma } from "../config/prisma.config.js";
import argon2 from "argon2";
// import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
// const JWT_SECRET = process.env.JWT_SECRET;

export const createUser = async (req, res) => {
  const userData = req.body; // capturing user data from the request body
  if (
    !userData.password ||
    !userData.email ||
    !userData.name ||
    !userData.role
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all fields" });
  }
  try {
    const hashedPassword = await argon2.hash(userData.password);
    userData.password = hashedPassword;

    if (!/\S+@\S+\.\S+/.test(userData.email)) {
      throw new Error("Invalid email format");
    }
    const user = await prisma.user.create({
      data: userData,
    });
    console.log(user);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getUserByEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
