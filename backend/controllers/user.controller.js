import { prisma } from "../config/prisma.config.js";
import argon2 from "argon2";
import dotenv from "dotenv";

dotenv.config();

export const createUser = async (req, res) => {
  try {
    const userData = req.body;
    console.log("Received user data:", userData);

    // Validation
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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser && existingUser.role === userData.role) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Email validation
    if (!/\S+@\S+\.\S+/.test(userData.email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Hash password
    const hashedPassword = await argon2.hash(userData.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
      },
    });

    // Remove password from response
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
    const { email, password } = req.body;
    console.log("Login attempt for:", email);

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const foundUser = await prisma.user.findUnique({
      where: { email: email },
    });

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

    // Remove password from response
    const { password: _, ...userWithoutPassword } = foundUser;

    console.log("User authenticated successfully:", userWithoutPassword);
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error("Server error during login:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error during login",
    });
  }
};
