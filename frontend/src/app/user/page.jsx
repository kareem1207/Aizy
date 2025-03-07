"use client";
import jwt from "jsonwebtoken";
import { useRouter } from "next/navigation";
import { useUserStore } from "../../store/userStore";
import { useEffect, useState } from "react";

const User = () => {
    const router = useRouter();
    const { logoutUser } = useUserStore();
    const [userData, setUserData] = useState({ name: "", email: "", role: "" });
    useEffect(() => {
        const token = localStorage.getItem("user_login_token");
        
        if (token) {
            try {
                const decoded = jwt.decode(token);
                setUserData({
                    name: decoded?.username || "Not Available",
                    email: decoded?.email || "Not Available",
                    role: decoded?.role || "Not Available"
                });
                console.log("Decoded Token:", decoded);
            } catch (error) {
                console.error("Error decoding token:", error);
            }
        } else {
            router.push("/login");
        }
    }, [router]);
    
    const handleLogout = () => {
        const result = logoutUser();
        if (result.success) {
            location.reload();
            router.push("/login");
        }
    };

    return (
      <div className="min-h-screen bg-[#fffcf6] text-[#3c6ca8] p-4 md:p-8 font-sans">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-6 transition-all hover:shadow-lg">
          <h1 className="text-3xl font-bold mb-8 border-b border-[#3c6ca8]/20 pb-4 text-center md:text-left">
            User Dashboard
          </h1>
          
          <div className="space-y-8">
            <div className="bg-[#f8fafd] rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Your Profile
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-lg shadow-sm border border-[#3c6ca8]/10 hover:shadow-md transition-shadow">
                  <p className="text-sm text-[#3c6ca8]/60 mb-2 uppercase tracking-wider font-medium">Name</p>
                  <p className="text-lg font-medium">{userData.name}</p>
                </div>
                
                <div className="bg-white p-5 rounded-lg shadow-sm border border-[#3c6ca8]/10 hover:shadow-md transition-shadow">
                  <p className="text-sm text-[#3c6ca8]/60 mb-2 uppercase tracking-wider font-medium">Email</p>
                  <p className="text-lg font-medium overflow-hidden text-ellipsis">{userData.email}</p>
                </div>
                
                <div className="bg-white p-5 rounded-lg shadow-sm border border-[#3c6ca8]/10 hover:shadow-md transition-shadow">
                  <p className="text-sm text-[#3c6ca8]/60 mb-2 uppercase tracking-wider font-medium">Role</p>
                  <p className="text-lg font-medium">
                    <span className="inline-block px-4 py-1.5 text-sm rounded-full bg-[#edf3fa] text-[#3c6ca8] font-semibold">
                      {userData.role}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-10 flex flex-col sm:flex-row justify-end gap-4">
              <button 
                onClick={handleLogout}
                className="px-6 py-2.5 bg-white border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors font-medium flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
};

export default User;