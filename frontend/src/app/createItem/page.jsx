"use client"
import React, { useState, useEffect } from 'react'
import { useProductStore } from '@/store/productStore'
import jwt, { decode } from 'jsonwebtoken';
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [decoded, setDecoded] = useState(null);
  const { createProduct } = useProductStore();
  const [newProduct, setNewProduct] = useState({
    name: '',
    email: '',
    category: '',
    shortDescription: '',
    description: '',
    price: 0,
    sellersName: '',
    count: 0,
  });

  useEffect(() => {
    console.log("In useEffect");
    // Access localStorage only on the client side
    const storedToken = window.localStorage.getItem("user_login_token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Add a second useEffect that runs when token changes
  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwt.decode(token);
        console.log("Decoded token:", decodedToken);
        setDecoded(decodedToken);
        
        if (decodedToken && decodedToken.email) {
          setNewProduct(prev => ({
            ...prev,
            sellersEmail: decodedToken.email  // Change from 'email' to 'sellersEmail'
          }));
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, [token]);

  const handleCreateProduct = async (productData) => {
    console.log("in nhcp"+productData);
    const res = await createProduct(productData);
    if (res.success) {
      alert(res.message);
        setNewProduct({
            name: '',
            email: '',
            category: '',
            shortDescription: '',
            description: '',
            price: 0,
            sellersName: '',
            count: 0,
        });
        router.push('/'); // Redirect to the home page or any other page
    } else {
      alert(res.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedProduct = {
      ...newProduct,
      name: e.target.name.value,
      category: e.target.category.value,
      shortDescription: e.target.shortDescription.value,
      description: e.target.description.value,
      price: parseFloat(e.target.price.value),
      sellersName: e.target.sellersName.value,
      sellersEmail: newProduct.sellersEmail, // Make sure the email is properly included
      count: parseInt(e.target.count.value, 10),
    };
    console.log(updatedProduct);
    handleCreateProduct(updatedProduct);
  };
    
  return (
    <div className="min-h-screen bg-[#fffcf6] text-[#3c6ca8] p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-6 transition-all hover:shadow-lg">
        <h1 className="text-3xl font-bold mb-8 border-b border-[#3c6ca8]/20 pb-4 text-center md:text-left">
          Create New Product
        </h1>
        
        <div className="bg-[#f8fafd] rounded-xl p-6 shadow-sm mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#3c6ca8]/70">Product Name</label>
                <input 
                  type="text" 
                  name="name" 
                  placeholder="Enter product name" 
                  className="w-full px-4 py-2.5 rounded-lg border border-[#3c6ca8]/20 focus:outline-none focus:ring-2 focus:ring-[#3c6ca8]/50 bg-white"
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#3c6ca8]/70">Category</label>
                <input 
                  type="text" 
                  name="category" 
                  placeholder="Enter product category" 
                  className="w-full px-4 py-2.5 rounded-lg border border-[#3c6ca8]/20 focus:outline-none focus:ring-2 focus:ring-[#3c6ca8]/50 bg-white"
                  required 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#3c6ca8]/70">Short Description</label>
              <input 
                type="text" 
                name="shortDescription" 
                placeholder="Brief summary of the product" 
                className="w-full px-4 py-2.5 rounded-lg border border-[#3c6ca8]/20 focus:outline-none focus:ring-2 focus:ring-[#3c6ca8]/50 bg-white"
                required 
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#3c6ca8]/70">Full Description</label>
              <textarea 
                name="description" 
                placeholder="Detailed product description" 
                className="w-full px-4 py-2.5 rounded-lg border border-[#3c6ca8]/20 focus:outline-none focus:ring-2 focus:ring-[#3c6ca8]/50 bg-white min-h-[120px]"
                required
              />
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#3c6ca8]/70">Price</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-[#3c6ca8]/60">$</span>
                  </div>
                  <input 
                    type="number" 
                    name="price" 
                    placeholder="0.00" 
                    className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-[#3c6ca8]/20 focus:outline-none focus:ring-2 focus:ring-[#3c6ca8]/50 bg-white"
                    min="0"
                    step="0.01"
                    required 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#3c6ca8]/70">Seller's Name</label>
                <input 
                  type="text" 
                  name="sellersName" 
                  placeholder="Your name" 
                  className="w-full px-4 py-2.5 rounded-lg border border-[#3c6ca8]/20 focus:outline-none focus:ring-2 focus:ring-[#3c6ca8]/50 bg-white"
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#3c6ca8]/70">Inventory Count</label>
                <input 
                  type="number" 
                  name="count" 
                  placeholder="Available quantity" 
                  className="w-full px-4 py-2.5 rounded-lg border border-[#3c6ca8]/20 focus:outline-none focus:ring-2 focus:ring-[#3c6ca8]/50 bg-white"
                  min="0"
                  required 
                />
              </div>
            </div>
            
            <div className="pt-4">
              <button 
                type="submit"
                className="px-6 py-3 bg-[#3c6ca8] text-white rounded-lg hover:bg-[#3c6ca8]/90 transition-colors font-medium flex items-center justify-center w-full md:w-auto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Page