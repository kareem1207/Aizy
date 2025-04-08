"use client";

import { useState, useEffect } from "react";

export const SellerProducts = ({data, edit, delete: deleteProduct, isEdit, isDelete}) => {
  const [updatedData, setUpdatedData] = useState(data);
  const [itemInfo, setItemInfo] = useState({
      id: '',
      name: '',
      category: '',
      shortDescription: '',
      description: '',
      price: 0,
      sellersName: '',
      count: 0,
      image: '',
      imageType: '',
  });
  const [open, setOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setUpdatedData(data);
  }, [data]);

  const handleEdit = (productId) => {
    const foundItem = data.find(item => item._id === productId);
    setItemInfo(foundItem);
    if (foundItem.image) {
      setImagePreview(foundItem.image);
    }
    setOpen(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    edit(itemInfo); 
    isEdit(true);   
    setUpdatedData(updatedData.map(item => 
        item._id === itemInfo._id ? { ...item, ...itemInfo } : item
    ));
    setOpen(false);
  };
  
  const handleDelete = (productId) => {
    deleteProduct(productId);
    isDelete(true);
    setUpdatedData(updatedData.filter(item => item._id !== productId));
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
      
      setItemInfo({
        ...itemInfo,
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
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-xl p-6 transition-all">
        <h1 className="text-3xl font-bold mb-8 border-b border-[#3c6ca8]/20 pb-4 text-center md:text-left">
          Your Products
        </h1>
        
        {updatedData.length > 0 ? (
          <div className="grid gap-4">
            {updatedData?.map(product => (
              <div key={product._id} className="bg-[#f8fafd] p-4 rounded-lg flex justify-between items-center hover:shadow-md transition-shadow border border-[#3c6ca8]/10">
                <div className="flex items-center flex-1">
                  {product.image ? (
                    <div className="h-16 w-16 mr-4 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-16 w-16 mr-4 rounded-lg bg-[#e9f0f9] flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#3c6ca8]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-lg">{product.name}</h3>
                    <div className="flex items-center mt-1 text-sm">
                      <span className="bg-[#edf3fa] px-2 py-0.5 rounded-md text-[#3c6ca8]/80">{product.category}</span>
                      <span className="ml-3 text-[#3c6ca8]/60">${product.price}</span>
                      <span className="ml-3 text-[#3c6ca8]/60">{product.count} in stock</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEdit(product._id)}
                    className="p-2 bg-[#3c6ca8]/10 hover:bg-[#3c6ca8]/20 text-[#3c6ca8] rounded-lg transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleDelete(product._id)}
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-[#f8fafd] rounded-lg border border-[#3c6ca8]/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-[#3c6ca8]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="mt-4 text-lg text-[#3c6ca8]/70">No products available.</p>
          </div>
        )}
        
        {open && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-4 border-b border-[#3c6ca8]/10">
                <h2 className="text-xl font-semibold text-[#3c6ca8]">Edit Product</h2>
                <button 
                  onClick={() => setOpen(false)}
                  className="text-[#3c6ca8]/60 hover:text-[#3c6ca8] p-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleUpdate} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[#3c6ca8]/70 mb-1">Product Image</label>
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
                            setItemInfo({...itemInfo, image: '', imageType: ''});
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="py-8">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-[#3c6ca8]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-2 text-sm text-[#3c6ca8]/60">Click to upload or drag and drop</p>
                        <p className="text-xs text-[#3c6ca8]/40 mt-1">PNG, JPG, GIF or WEBP (max. 5MB)</p>
                      </div>
                    )}
                    
                    <input
                      type="file"
                      accept="image/jpeg, image/png, image/gif, image/webp"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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
                
                <div>
                  <label className="block text-sm font-medium text-[#3c6ca8]/70 mb-1">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={itemInfo.name}
                    onChange={(e) => setItemInfo({ ...itemInfo, name: e.target.value })}
                    placeholder="Product Name"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#3c6ca8]/20 focus:outline-none focus:ring-2 focus:ring-[#3c6ca8]/50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#3c6ca8]/70 mb-1">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={itemInfo.category}
                    onChange={(e) => setItemInfo({ ...itemInfo, category: e.target.value })}
                    placeholder="Category"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#3c6ca8]/20 focus:outline-none focus:ring-2 focus:ring-[#3c6ca8]/50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#3c6ca8]/70 mb-1">Short Description</label>
                  <input
                    type="text"
                    name="shortDescription"
                    value={itemInfo.shortDescription}
                    onChange={(e) => setItemInfo({ ...itemInfo, shortDescription: e.target.value })}
                    placeholder="Short Description"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#3c6ca8]/20 focus:outline-none focus:ring-2 focus:ring-[#3c6ca8]/50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#3c6ca8]/70 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={itemInfo.description}
                    onChange={(e) => setItemInfo({ ...itemInfo, description: e.target.value })}
                    placeholder="Description"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#3c6ca8]/20 focus:outline-none focus:ring-2 focus:ring-[#3c6ca8]/50 min-h-[100px]"
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#3c6ca8]/70 mb-1">Price</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-[#3c6ca8]/60">$</span>
                    </div>
                    <input
                      type="number"
                      name="price"
                      value={itemInfo.price}
                      onChange={(e) => setItemInfo({ ...itemInfo, price: e.target.value })}
                      placeholder="Price"
                      className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-[#3c6ca8]/20 focus:outline-none focus:ring-2 focus:ring-[#3c6ca8]/50"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#3c6ca8]/70 mb-1">Seller's Name</label>
                  <input
                    type="text"
                    name="sellersName"
                    value={itemInfo.sellersName}
                    onChange={(e) => setItemInfo({ ...itemInfo, sellersName: e.target.value })}
                    placeholder="Seller's Name"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#3c6ca8]/20 focus:outline-none focus:ring-2 focus:ring-[#3c6ca8]/50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#3c6ca8]/70 mb-1">Count in Stock</label>
                  <input
                    type="number"
                    name="count"
                    value={itemInfo.count}
                    onChange={(e) => setItemInfo({ ...itemInfo, count: e.target.value })}
                    placeholder="Count in Stock"
                    className="w-full px-4 py-2.5 rounded-lg border border-[#3c6ca8]/20 focus:outline-none focus:ring-2 focus:ring-[#3c6ca8]/50"
                  />
                </div>
                
                <div className="flex justify-end pt-4 space-x-3">
                  <button 
                    type="button" 
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 border border-[#3c6ca8]/30 text-[#3c6ca8] rounded-lg hover:bg-[#3c6ca8]/10"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-[#3c6ca8] text-white rounded-lg hover:bg-[#3c6ca8]/90"
                    disabled={isUploading}
                  >
                    Update Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
