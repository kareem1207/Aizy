"use client"
import React, { useState, useEffect } from 'react'
import { useProductStore } from '@/store/productStore'
import jwt from 'jsonwebtoken';
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
    image: '',
    imageType: '',
  });
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    console.log("In useEffect");
    const storedToken = window.localStorage.getItem("user_login_token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwt.decode(token);
        console.log("Decoded token:", decodedToken);
        setDecoded(decodedToken);
        
        if (decodedToken && decodedToken.email) {
          setNewProduct(prev => ({
            ...prev,
            sellersEmail: decodedToken.email  
          }));
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, [token]);

  const handleCreateProduct = async (productData) => {
    console.log("Creating new product:", productData);
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
            image: '',
            imageType: '',
        });
        setImagePreview('');
        router.push('/'); 
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
      sellersEmail: newProduct.sellersEmail, 
      count: parseInt(e.target.count.value, 10),
      image: newProduct.image,
      imageType: newProduct.imageType,
    };
    console.log(updatedProduct);
    handleCreateProduct(updatedProduct);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, GIF, or WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Please upload an image smaller than 5MB');
      return;
    }

    setIsUploading(true);
    
    const reader = new FileReader();
    
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      const MAX_WIDTH = 1200;
      const MAX_HEIGHT = 1200;
      
      if (width > height && width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      } else if (height > MAX_HEIGHT) {
        width = Math.round((width * MAX_HEIGHT) / height);
        height = MAX_HEIGHT;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      const quality = file.type === 'image/jpeg' ? 0.85 : 0.9;
      const base64String = canvas.toDataURL(file.type, quality);
      
      setNewProduct({
        ...newProduct,
        image: base64String,
        imageType: file.type
      });
      setImagePreview(base64String);
      setIsUploading(false);
    };
    
    img.onerror = () => {
      alert('Error processing the image');
      setIsUploading(false);
    };
    
    reader.onloadend = () => {
      img.src = reader.result;
    };
    reader.onerror = () => {
      alert('Error reading the file');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
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
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#3c6ca8]/70">Product Image</label>
              <div className="border-2 border-dashed border-[#3c6ca8]/30 rounded-lg p-4 text-center relative">
                {imagePreview ? (
                  <div className="relative mx-auto w-full max-w-[300px] aspect-square mb-4">
                    <img
                      src={imagePreview}
                      alt="Product preview" 
                      className="rounded-md object-contain w-full h-full"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setNewProduct({...newProduct, image: '', imageType: ''});
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div onClick={() => document.getElementById('image-upload').click()} className="cursor-pointer">
                    <div className="py-8">
                      <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-[#3c6ca8]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-2 text-sm text-[#3c6ca8]/60">Click to upload or drag and drop</p>
                      <p className="text-xs text-[#3c6ca8]/40 mt-1">PNG, JPG, GIF or WEBP (max. 5MB)</p>
                    </div>
                  </div>
                )}
                
                <input
                  id="image-upload"
                  type="file"
                  accept="image/jpeg, image/png, image/gif, image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
                
                {isUploading && (
                  <div className="mt-2 text-[#3c6ca8]">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#3c6ca8] mx-auto"></div>
                    <p className="text-sm mt-1">Uploading...</p>
                  </div>
                )}
              </div>
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
                disabled={isUploading}
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