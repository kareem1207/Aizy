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
        const token = sessionStorage.getItem("user_login_token");
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
      <div className="min-h-screen bg-[#fffcf6] text-[#3c6ca8] p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-6 border-b pb-4">User Dashboard</h1>
          
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
              <h2 className="text-2xl font-semibold mb-4">Your Profile</h2>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Name</p>
                  <p className="text-lg font-medium">{userData.name}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="text-lg font-medium overflow-hidden text-ellipsis">{userData.email}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Role</p>
                  <p className="text-lg font-medium capitalize">
                    <span className="inline-block px-3 py-1 text-sm rounded-full bg-[#edf3fa] text-[#3c6ca8]">
                      {userData.role}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4">
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-white border border-red-500 text-red-500 rounded hover:bg-red-50 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
};

export default User;