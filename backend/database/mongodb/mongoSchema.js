import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sellersName: {
      type: String,
      required: false,
    },
    category: {
      type: String,
      required: true,
    },
    sellersEmail: {
      // Changed from having a unique index
      type: String,
      required: false,
      default: "", // Providing a default value to avoid null
    },
    shortDescription: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    count: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      required: false,
      default: 0,
    },
    // image: {
    //   type: Buffer,
    //   required: true,
    // },
  },
  {
    timestamps: true,
  }
);

// Remove any existing unique index on sellersEmail if it exists
// You'll need to do this in your MongoDB directly or via Mongoose connection

const Product = mongoose.model("Product", productSchema);

export default Product;
