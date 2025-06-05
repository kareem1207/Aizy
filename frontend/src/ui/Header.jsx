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
        <div className="fixed top-0 z-50 bg-[#fffcf6] shadow-sm mt-8">
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

                </div>
            </header>
        </div>
    );
};