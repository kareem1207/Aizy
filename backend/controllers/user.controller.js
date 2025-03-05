import { prisma } from "../config/prisma.config.js";
import argon2 from "argon2";
import dotenv from "dotenv";

dotenv.config();

export const createUser = async (req, res) => {
  const userData = req.body;
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

export const getUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }
  try {
    const foundUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (
      !foundUser ||
      !(await argon2.verify(foundUser.password, req.body.password))
    ) {
      throw new Error("Invalid email or password");
    } else {
      console.log("User found", foundUser);
    }

    res.status(200).json({ success: true, data: foundUser });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
