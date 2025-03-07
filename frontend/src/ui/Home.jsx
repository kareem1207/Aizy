"use client";

import { useState, useEffect } from 'react';
import { Card } from "@/components/Card";
// import data from "@/api/item/data.json";
import { motion, AnimatePresence } from "framer-motion";
import { useProductStore } from "@/store/productStore";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const titleVariants = {
  hidden: { y: -100, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      duration: 0.8
    }
  }
};

const backgroundVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      duration: 1.5,
      ease: "easeOut"
    }
  }
};

const textVariants = {
  hidden: { x: -50, opacity: 0 },
  show: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
      duration: 0.8
    }
  }
};

const loadingVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const { getProducts } = useProductStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await getProducts();
        setProducts(data.products);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);
console.log(products);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="home-container"
        initial="hidden"
        animate="show"
        exit="hidden"
        variants={backgroundVariants}
        className="min-h-screen  bg-[#fffcf6] to-blue-50 py-16 overflow-hidden"
      >
        <motion.div
          variants={containerVariants}
          className="container mx-auto px-4 mb-12 text-center"
        >
          <motion.h1 
            variants={titleVariants}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Welcome to{" "}
            <motion.span
              className="text-[] inline-block"
              whileHover={{ 
                scale: 1.1,
                color: "#4F46E5",
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              Aizy
            </motion.span>
          </motion.h1>
          <motion.p
            variants={textVariants}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Discover our amazing collection of products curated just for you
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          className="container mx-auto px-4"
        >
          {isLoading ? (
            <motion.div
              variants={loadingVariants}
              className="flex justify-center items-center h-64"
            >
              <motion.div
                className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full"
                animate={{
                  rotate: 360
                }}
                transition={{
                  duration: 1,
                  ease: "linear",
                  repeat: Infinity
                }}
              />
            </motion.div>
          ) : (
            <Card card={products} />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Home;