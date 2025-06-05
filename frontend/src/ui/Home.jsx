"use client";

import { useState, useEffect } from 'react';
import { Card } from "@/components/Card"; 
import { useProductStore } from "@/store/productStore";
import { useUserStore } from "@/store/userStore";
import { Chat } from '@/components/Chat';
import { BsRobot} from "react-icons/bs";
import { SearchBar } from '@/components/SearchBar';

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const { getProducts } = useProductStore();
  const { user } = useUserStore();
  const [aiChat, setAiChat] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await getProducts();
        setProducts(data.data);
        setFilteredProducts(data.data);
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

  // Filter products based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };
  
  return (
    <>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(50px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
      
      <div className={`min-h-screen bg-[#fffcf6] py-8 overflow-hidden transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          {!searchQuery && (
            <div className="container mx-auto px-8 mb-8">
              <div className={`max-w-6xl transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0'}`}> {/* Removed mx-auto here */}
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
              </div>
            </div>
          )}

          {/* Search Results Header */}
              <div className="container mx-auto px-8 py-4">
        <SearchBar onSearch={handleSearch} />
      </div>

        {searchQuery && (
          <div className="container mx-auto px-8 mb-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-semibold text-[#3c6ca8] mb-2">
                Search Results for "{searchQuery}"
              </h2>
              <p className="text-[#3c6ca8]/60">
                Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {/* Products Section */}
        <div className="container mx-auto px-8">
          {isLoading ? (
            <div className={`flex justify-center items-center h-64 transform transition-all duration-500 ${isVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
              <div className="w-16 h-16 border-4 border-[#3c6ca8] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-[#3c6ca8]/40 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[#3c6ca8]/60 mb-2">
                {searchQuery ? `No products found for "${searchQuery}"` : 'No products available'}
              </h3>
              <p className="text-[#3c6ca8]/40">
                {searchQuery ? 'Try searching with different keywords' : 'Check back later for new products'}
              </p>
            </div>
          ) : (
            <div className={`transition-all duration-1000 delay-1200 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
              <Card card={filteredProducts} />
            </div>
          )}
        </div>
      </div>

      {/* Floating AI Chat Button */}
      <button 
        onClick={() => setAiChat(!aiChat)} 
        className="fixed bottom-8 right-8 z-[9999] bg-blue-600 text-white p-4 rounded-full hover:bg-blue-700 hover:scale-110 transition-all duration-200 shadow-2xl border-4 border-white"
        style={{ 
          position: 'fixed',
          bottom: '32px',
          left: '32px',
          zIndex: 9999,
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <BsRobot className="text-2xl" />
      </button>

      {/* AI Chat Modal */}
      {aiChat && <Chat close={setAiChat} />}
    </>
  );
};

export default Home;