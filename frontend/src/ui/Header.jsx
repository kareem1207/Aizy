"use client";
import { useState, useEffect } from "react";
import { Language } from "@/components/Language";
import { Location } from "@/components/Location";
import { SearchBar } from "@/components/SearchBar";
import Image from "next/image";
import Link from "next/link";

export const Header = () => {
    const [token, setToken] = useState(null);
    useEffect(() => {
        setToken(localStorage.getItem("user_login_token"));
    }, []);
    
    return (
        <div className="sticky top-0 z-50 bg-[#fffcf6] shadow-sm">
            <header className="container mx-auto">
                <div className="flex items-center h-16 px-4 gap-6">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0">
                        <Image 
                            src="/logo.jpg" 
                            alt="Store Logo" 
                            width={150} 
                            height={50} 
                            className="object-contain hover:opacity-90 transition-opacity"
                        />
                    </Link>

                    {/* Location */}
                    <div className="md:flex flex-shrink-0">
                        <Location />
                    </div>

                    {/* Search Bar */}
                    <div className="md:flex flex-1 max-w-[600px]">
                        <SearchBar />
                    </div>

                    {/* Language Selector */}
                    <div className="md:flex flex-shrink-0">
                        <Language />
                    </div>

                    {!token && (
                        <div className="md:flex flex-shrink-0">
                            <Link href="/login" className="text-[#3c6ca8] hover:underline font-medium">
                                Login 
                            </Link>
                        </div>
                    )}

                    {token && (
                        <div className="md:flex flex-shrink-0">
                            <Link href="/user" className="text-[#3c6ca8] hover:underline font-medium">
                                Account 
                            </Link>
                        </div>
                    )}

                    {/* Mobile Menu */}
                    <button className="md:hidden p-2 rounded-lg hover:bg-gray-100">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </header>
        </div>
    );
};