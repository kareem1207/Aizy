"use client";
import { SellerProducts } from '@/components/SellerProducts';
import { useProductStore } from '../store/productStore'
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Forecast } from '@/components/Forecast';

export const Seller = () => {
    const [editItem, setEditItem] = useState(null);
    const [deleteItem, setDeleteItem] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [isDelete, setIsDelete] = useState(false);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForecast, setShowForecast] = useState(false);
    const { getProductsBySeller, deleteProduct, updateProduct } = useProductStore();
    
    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                const res = await getProductsBySeller();
                setProducts(res.data || []);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchProducts();
    }, [getProductsBySeller, isEdit, isDelete]);
    
    const deleteProductById = async(id) => {
        const res = await deleteProduct(id);
        return res;
    }
    
    const updateProductById = async(id, updatedProduct) => {
        const res = await updateProduct(id, updatedProduct);
        return res;
    }

    if(isEdit) {
        updateProductById(editItem._id, editItem);
        setIsEdit(false);
    }
    
    if(isDelete) {
        deleteProductById(deleteItem);
        setIsDelete(false);
    }

    console.log("Products:", products);
        
    return (
        <div className="min-h-screen bg-[#fffcf6] text-[#3c6ca8] p-4 md:p-8 font-sans">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="bg-white rounded-xl shadow-xl p-6">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-[#3c6ca8]/20 pb-6">
                        <h1 className="text-3xl font-bold text-[#3c6ca8]">Seller Dashboard</h1>
                        <Link 
                            href="/createItem"
                            className="mt-4 md:mt-0 px-5 py-2.5 bg-[#3c6ca8] text-white rounded-lg hover:bg-[#3c6ca8]/90 transition-colors flex items-center font-medium"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create New Product
                        </Link>
                    </div>
                    
                    <div className="mb-6">
                        <h2 className="text-xl font-medium mb-2">Your Products</h2>
                        <p className="text-[#3c6ca8]/60">Manage your product listings and inventory</p>
                    </div>
                    
                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3c6ca8]"></div>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-[#3c6ca8]/40 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-[#3c6ca8]/60 mb-2">No products yet</h3>
                            <p className="text-[#3c6ca8]/40 mb-4">Start by creating your first product</p>
                            <Link 
                                href="/createItem"
                                className="inline-flex items-center px-4 py-2 bg-[#3c6ca8] text-white rounded-lg hover:bg-[#3c6ca8]/90 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create Product
                            </Link>
                        </div>
                    ) : (
                        <SellerProducts 
                            data={products} 
                            edit={setEditItem} 
                            delete={setDeleteItem} 
                            isEdit={setIsEdit} 
                            isDelete={setIsDelete} 
                        />
                    )}
                </div>
                
                {products.length > 0 && (
                    <div className="bg-white rounded-xl shadow-xl p-6">
                        <h2 className="text-xl font-medium mb-4">Seller Tools</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={() => setShowForecast(true)}
                                className="bg-[#f8fafd] p-5 rounded-lg border border-[#3c6ca8]/10 hover:shadow-md hover:border-[#3c6ca8]/30 transition-all group cursor-pointer"
                            >
                                <div className="text-[#3c6ca8] mb-2 group-hover:scale-110 transition-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h3 className="font-medium mb-1 group-hover:text-[#3c6ca8] transition-colors">AI Sales Forecast</h3>
                                <p className="text-sm text-[#3c6ca8]/60 group-hover:text-[#3c6ca8]/80 transition-colors">Get AI-powered sales predictions and insights</p>
                            </button>
                            
                            <div className="bg-[#f8fafd] p-5 rounded-lg border border-[#3c6ca8]/10 hover:shadow-md transition-all">
                                <div className="text-[#3c6ca8] mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="font-medium mb-1">Payments</h3>
                                <p className="text-sm text-[#3c6ca8]/60">Manage earnings and payouts</p>
                            </div>
                            
                            <div className="bg-[#f8fafd] p-5 rounded-lg border border-[#3c6ca8]/10 hover:shadow-md transition-all">
                                <div className="text-[#3c6ca8] mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="font-medium mb-1">Orders</h3>
                                <p className="text-sm text-[#3c6ca8]/60">Track and fulfill customer orders</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Forecast Modal */}
            {showForecast && <Forecast onClose={() => setShowForecast(false)} />}
        </div>
    );
};