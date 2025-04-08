import mongoose from "mongoose";
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
      sellersName,
      sellersEmail,
      count,
      rating,
      image,
      imageType,
    } = req.body;

    if (image && image.length > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message:
          "Image size too large. Please upload an image smaller than 5MB.",
      });
    }

    const product = new Product({
      name,
      category,
      shortDescription,
      description,
      price,
      sellersEmail,
      sellersName,
      count,
      rating,
      image,
      imageType,
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

export const getProductImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    const product = await Product.findById(id).select("image imageType");

    if (!product || !product.image) {
      return res.status(404).json({
        success: false,
        message: "Product image not found",
      });
    }

    res.status(200).json({
      success: true,
      image: product.image,
      imageType: product.imageType || "image/jpeg",
    });
  } catch (error) {
    console.error("Error fetching product image:", error);
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

    if (productId === "create") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID: 'create' is a reserved word",
      });
    }

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

export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ success: false, message: "Invalid product ID" });
  }
  try {
    await Product.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const product = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ success: false, message: "Invalid product ID" });
  }
  g;
  if (product.image && product.image.length > 5 * 1024 * 1024) {
    return res.status(400).json({
      success: false,
      message: "Image size too large. Please upload an image smaller than 5MB.",
    });
  }

  try {
    const update = await Product.findByIdAndUpdate(id, product, { new: true });
    res.status(200).json({ success: true, data: update });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getProductsByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const products = await Product.find({ sellersEmail: email });

    console.log(`Found ${products.length} products for email: ${email}`);

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error in getProductsByEmail:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const products = await Product.find({ category }).sort({ createdAt: -1 });
    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found in this category",
      });
    }
    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getProductsByName = async (req, res) => {
  try {
    const name = req.params.name;
    const products = await Product.find({
      name: { $regex: name, $options: "i" },
    }).sort({ createdAt: -1 });
    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found with this name",
      });
    }
    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error fetching products by name:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getProductsByRating = async (req, res) => {
  try {
    const rating = req.params.rating;
    const products = await Product.find({ rating }).sort({ createdAt: -1 });
    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found with this rating",
      });
    }
    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error fetching products by rating:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
