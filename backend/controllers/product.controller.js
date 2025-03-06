import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import Product from "../database/mongodb/mongoSchema.js";
import dotenv from "dotenv";
dotenv.config();

export const addProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      shortDescription,
      description,
      price,
      sellers_name,
    } = req.body;
    // const image = req.file.buffer;

    const product = new Product({
      name,
      category,
      shortDescription,
      description,
      price,
      //   image,
    });
    await product.save();
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    // Check if the ID is "create" or another special route and handle accordingly
    if (productId === "create") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID: 'create' is a reserved word",
      });
    }

    // Validate that the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
