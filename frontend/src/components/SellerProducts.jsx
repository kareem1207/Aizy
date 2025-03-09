"use client";

import { useState } from "react";

export const SellerProducts = ({data, edit, delete: deleteProduct, isEdit, isDelete}) => {
  const [updatedData,setUpdatedData] = useState(data);
  const [itemInfo, setItemInfo] = useState({
      id: '',
      name: '',
      category: '',
      shortDescription: '',
      description: '',
      price: 0,
      sellersName: '',
      count: 0,
  });
  const [open, setOpen] = useState(false);

  const handleEdit = (productId) => {
    const foundItem = data.find(item => item._id === productId);
    setItemInfo(foundItem);
    setOpen(true);
    // This line has issues - it uses itemInfo before state is updated
    // Also, it might not be necessary depending on your use case
    setUpdatedData(data.map(item => item._id === productId ? { ...item, ...foundItem } : item));
};

const handleUpdate = (e) => {
    e.preventDefault();
    edit(itemInfo); // Assuming this is an API call or similar
    isEdit(true);   // Assuming this is a setter function, should be setIsEdit if it's useState
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
                <div className="flex-1">
                  <h3 className="font-medium text-lg">{product.name}</h3>
                  <div className="flex items-center mt-1 text-sm">
                    <span className="bg-[#edf3fa] px-2 py-0.5 rounded-md text-[#3c6ca8]/80">{product.category}</span>
                    <span className="ml-3 text-[#3c6ca8]/60">${product.price}</span>
                    <span className="ml-3 text-[#3c6ca8]/60">{product.count} in stock</span>
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
