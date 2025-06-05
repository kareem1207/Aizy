"use client";

import { useState, useEffect } from 'react';
import { Card } from "@/components/Card"; 
import { useProductStore } from "@/store/productStore";
import { useUserStore } from "@/store/userStore";

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const { getProducts } = useProductStore();
  const { user } = useUserStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await getProducts();
        setProducts(data.data);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    
    // Trigger animations after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [getProducts]);
  
  return (
    <div className={`min-h-screen bg-[#fffcf6] py-8 overflow-hidden transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Hero Section */}
      <div className="container mx-auto px-8 mb-8">
        <div className={`max-w-6xl mx-auto transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0'} flex justify-between items-center`}>
          <div className="text-left">
            <h1 className="text-7xl md:text-6xl text-[#3c6ca8] leading-tight">
              Less effort,
              <br />
              More elegance.
            </h1>
            <p className={`text-7xl md:text-3xl font-semibold text-[#3c6ca8] leading-tight transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'}`}>
              Powered by{" "}
              <span className="inline-block hover:scale-105 transition-transform duration-200">
                AI Magic.
              </span>
            </p>
          </div>
          
          {/* AI Chat Button - Always visible and positioned on the right */}
          <div className={`transform transition-all duration-1000 delay-700 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}`}>
            <button className="bg-[#3c6ca8] text-[#fffcf6] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#3c6ca8]/90 hover:scale-105 hover:shadow-lg hover:shadow-[#3c6ca8]/30 active:scale-95 transition-all duration-200 shadow-lg border-2 border-[#3c6ca8]">
              Chat
            </button>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-8">
        
        {isLoading ? (
          <div className={`flex justify-center items-center h-64 transform transition-all duration-500 ${isVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
            <div className="w-16 h-16 border-4 border-[#3c6ca8] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className={`transition-all duration-1000 delay-1200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <Card card={products} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;