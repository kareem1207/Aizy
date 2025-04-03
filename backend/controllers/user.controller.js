import { prisma } from "../config/prisma.config.js";
import argon2 from "argon2";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
dotenv.config();

export const createUser = async (req, res) => {
  try {
    const userData = req.body;
    console.log("Received user data:", userData);

    if (
      !userData.password ||
      !userData.email ||
      !userData.name ||
      !userData.role
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const existingUserMany = await prisma.user.findMany({
      where: { email: userData.email, role: userData.role },
    });

    const existingUser = existingUserMany[0];

    if (existingUser && existingUser.role === userData.role) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    if (!/\S+@\S+\.\S+/.test(userData.email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const hashedPassword = await argon2.hash(userData.password);

    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
      },
    });

    const { password, ...userWithoutPassword } = user;

    console.log("User created successfully:", userWithoutPassword);
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error("Server error during user creation:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error during user creation",
    });
  }
};

export const getUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    console.log("Login attempt for:", email);

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const foundUserMAny = await prisma.user.findMany({
      where: { email: email, role: role },
    });

    const foundUser = foundUserMAny[0];

    if (!foundUser) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await argon2.verify(foundUser.password, password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (foundUser.role !== role) {
      return res.status(403).json({
        success: false,
        message: "User role mismatch",
      });
    }

    // const { password: _, ...userWithoutPassword } = foundUser;

    console.log("User authenticated successfully:", foundUser);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: foundUser,
    });
  } catch (error) {
    console.error("Server error during login:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error during login",
    });
  }
};

export const generateUserToken = async (req, res) => {
  console.log("Generating token for user:", req.body);
  const user = req.body;
  const secretKey = process.env.JWT_SECRET;
  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "User data is required." });
  }

  if (!user.email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required." });
  }
  const userPayLoadArray = await prisma.user.findMany({
    where: { AND: [{ email: user.email }, { role: user.userType }] },
  });

  const userPayLoad = userPayLoadArray[0];

  if (!userPayLoad) {
    return res.status(404).json({
      success: false,
      message: "User not found.",
    });
  }

  const payload = {
    userId: userPayLoad.id,
    username: userPayLoad.name,
    email: userPayLoad.email,
    role: userPayLoad.role,
  };

  const token = jwt.sign(payload, secretKey);
  res.json({ success: true, token });
};

export const generateOTP = async (req, res) => {
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
    digits: true,
  });

  if (otp == "")
    res.status(500).json({
      success: false,
      message: "Error generating OTP",
    });
  else {
    const secretKey = process.env.JWT_SECRET;
    const payload = {
      otp: otp,
    };
    const token = jwt.sign(payload, secretKey, { expiresIn: "5m" });
    res.status(200).json({
      success: true,
      message: "OTP generated successfully",
      data: token,
    });
  }
};
