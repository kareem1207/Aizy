"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { useCartStore } from "../store/cartStore";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const Card = ({ card }) => {
  const [flippedCards, setFlippedCards] = useState({});
  const { addToCart } = useCartStore();
  const [loadingProductId, setLoadingProductId] = useState(null);
  
  if (!card) {
    return null; 
  }
  
  const handleFlip = (index, e) => {
    e.stopPropagation();
    setFlippedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  const handleAddToCart = async (product, e) => {
    e.stopPropagation();
    
    if (loadingProductId) return;
    setLoadingProductId(product._id);
    
    try {
      if (product.count <= 0) {
        toast.error("Product is out of stock");
        return;
      }
      
      const result = await addToCart(product);
      
      if (result.success) {
        toast.success("Added to cart");
      } else {
        toast.error(result.message || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("An error occurred");
    } finally {
      setLoadingProductId(null);
    }
  };
  
  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {card && (card.map((item, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            className="relative bg-[#fffcf6] rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            style={{ height: "fit-content", minHeight: "450px" }}
          >
            <div className="relative">
              <div 
                className={`${flippedCards[index] ? 'hidden' : 'block'}`}
              >
                <div className="relative pt-[100%] bg-gray-100 overflow-hidden">
                  {item.image ? (
                    <div className="absolute inset-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      item.count > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.count > 0 ? `${item.count} in stock` : 'Out of stock'}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800 line-clamp-1">
                    {item.name}
                  </h2>

                  <p className="text-gray-600 line-clamp-2">{item.shortDescription}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{item.category}</span>
                    <span className="text-sm text-gray-500">|</span>
                    <span className="text-sm text-gray-500">{item.sellersName}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <motion.p 
                      className="text-2xl font-bold text-[#3c6ca8]"
                      whileHover={{ scale: 1.1 }}
                    >
                      ₹{item.price}
                    </motion.p>
                    <div className="flex items-center gap-1">
                      <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-semibold text-gray-700">{item.rating || "N/A"}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex-1 ${
                        item.count > 0 
                          ? 'bg-[#3c6ca8] hover:bg-[#2c5f8c]' 
                          : 'bg-gray-400 cursor-not-allowed'
                      } text-white py-2 rounded-lg font-semibold transition-colors flex justify-center items-center`}
                      onClick={(e) => handleAddToCart(item, e)}
                      disabled={item.count <= 0 || loadingProductId === item._id}
                    >
                      {loadingProductId === item._id ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        "Add to Cart"
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 border-2 border-gray-300 rounded-lg transition-colors"
                      onClick={(e) => handleFlip(index, e)}
                      aria-label="View details"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </motion.button>
                  </div>
                </div>
              </div>
              <div 
                className={`${flippedCards[index] ? 'block' : 'hidden'} bg-[#fffcf6] rounded-2xl`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {item.name}
                    </h2>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 border-2 border-gray-300 rounded-lg transition-colors"
                      onClick={(e) => handleFlip(index, e)}
                      aria-label="Close details"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-md font-medium text-gray-700 mb-2">Description:</h3>
                    <p className="text-gray-600 overflow-auto" style={{ maxHeight: "200px" }}>
                      {item.description || item.shortDescription}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-medium text-gray-700 mb-2">Created At:</h3>
                    <p className="text-gray-600 mb-6">
                      {formatDate(item.createdAt)}
                    </p>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-full ${
                          item.count > 0 
                            ? 'bg-[#3c6ca8] hover:bg-[#2c5f8c]' 
                            : 'bg-gray-400 cursor-not-allowed'
                        } text-white py-2 rounded-lg font-semibold transition-colors flex justify-center items-center`}
                        onClick={(e) => handleAddToCart(item, e)}
                        disabled={item.count <= 0 || loadingProductId === item._id}
                      >
                        {loadingProductId === item._id ? (
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          "Add to Cart"
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )))}
      </div>
    </>
  );
};