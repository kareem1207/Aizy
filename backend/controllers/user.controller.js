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

    const bannedUser = await prisma.bannedUser.findUnique({
      where: { userId: foundUser.id },
    });

    if (bannedUser) {
      if (
        bannedUser.bannedUntil &&
        new Date() > new Date(bannedUser.bannedUntil)
      ) {
        await prisma.bannedUser.delete({
          where: { userId: foundUser.id },
        });
      } else {
        return res.status(403).json({
          success: false,
          message: "Your account has been banned",
          reason: bannedUser.reason,
          bannedUntil: bannedUser.bannedUntil,
        });
      }
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

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!users) {
      return res.status(404).json({
        success: false,
        message: "No users found",
      });
    }

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Server error while fetching users:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error while fetching users",
    });
  }
};

export const banUser = async (req, res) => {
  try {
    const { userId, reason, banDuration } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingBan = await prisma.bannedUser.findUnique({
      where: { userId: userId },
    });

    if (existingBan) {
      return res.status(400).json({
        success: false,
        message: "User is already banned",
      });
    }

    let bannedUntil = null;
    if (banDuration) {
      bannedUntil = new Date();
      bannedUntil.setDate(bannedUntil.getDate() + parseInt(banDuration));
    }

    const bannedUser = await prisma.bannedUser.create({
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
        reason: reason || "Violation of terms of service",
        bannedUntil: bannedUntil,
      },
    });

    res.status(200).json({
      success: true,
      message: "User banned successfully",
      data: bannedUser,
    });
  } catch (error) {
    console.error("Error banning user:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while banning user",
    });
  }
};

export const unbanUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const bannedUser = await prisma.bannedUser.findUnique({
      where: { userId: userId },
    });

    if (!bannedUser) {
      return res.status(400).json({
        success: false,
        message: "This user is not banned",
      });
    }

    await prisma.bannedUser.delete({
      where: { userId: userId },
    });

    res.status(200).json({
      success: true,
      message: "User unbanned successfully",
    });
  } catch (error) {
    console.error("Error unbanning user:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while unbanning user",
    });
  }
};

export const getBannedUsers = async (req, res) => {
  try {
    const bannedUsers = await prisma.bannedUser.findMany();

    res.status(200).json({
      success: true,
      data: bannedUsers,
    });
  } catch (error) {
    console.error("Error fetching banned users:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error while fetching banned users",
    });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { name, email, password, adminId } = req.body;

    if (!name || !email || !password || !adminId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const currentAdminId = req.user.userId;

    if (adminId !== currentAdminId) {
      return res.status(403).json({
        success: false,
        message:
          "Invalid admin ID. You are not authorized to create admin accounts.",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can create new admin accounts",
      });
    }

    const existingUserMany = await prisma.user.findMany({
      where: { email: email, role: "admin" },
    });

    const existingUser = existingUserMany[0];

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An admin with this email already exists",
      });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const hashedPassword = await argon2.hash(password);

    const newAdmin = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
        role: "admin",
      },
    });

    const { password: _, ...adminWithoutPassword } = newAdmin;

    console.log("Admin created successfully:", adminWithoutPassword);

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: adminWithoutPassword,
    });
  } catch (error) {
    console.error("Server error during admin creation:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server Error during admin creation",
    });
  }
};
