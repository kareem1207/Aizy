"use client";
import { useState, useEffect } from "react";
import { Language } from "@/components/Language";
import { Location } from "@/components/Location";
import { SearchBar } from "@/components/SearchBar";
import Image from "next/image";
import Link from "next/link";
import { useUserStore } from "@/store/userStore";

export const Header = () => {
    const [token, setToken] = useState(null);
    const user = useUserStore(state => state.user);
    
    useEffect(() => {
        const checkToken = () => {
            const storedToken = localStorage.getItem("user_login_token");
            setToken(storedToken);
            console.log("Token checked:", storedToken ? "Found" : "Not found");
        };

        checkToken();
        
        const handleStorageChange = (e) => {
            if (e.key === "user_login_token") {
                checkToken();
            }
        };
        
        window.addEventListener("storage", handleStorageChange);
        
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [user]); 
    return (
        <div className="sticky top-0 z-50 bg-[#fffcf6] shadow-sm">
            <header className="container mx-auto">
                <div className="flex items-center h-16 px-4 gap-6">
                    <Link href="/" className="flex-shrink-0">
                        <Image 
                            src="/logo.jpg" 
                            alt="Store Logo" 
                            width={150} 
                            height={50} 
                            className="object-contain hover:opacity-90 transition-opacity"
                        />
                    </Link>

                    <div className="md:flex flex-shrink-0">
                        <Location />
                    </div>

                    <div className="md:flex flex-1 max-w-[600px]">
                        <SearchBar />
                    </div>

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
                            <Link 
                                href="/user" 
                                className="text-[#3c6ca8] hover:underline font-medium"
                                onClick={(e) => {
                                    console.log("Account link clicked, navigating to /user");
                                }}
                            >
                                Account 
                            </Link>
                        </div>
                    )}

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