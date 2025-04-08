"use client";
import jwt from "jsonwebtoken";
import { useRouter } from "next/navigation";
import { useUserStore } from "../../store/userStore";
import { useEffect, useState, useRef } from "react";
const User = () => {
    const router = useRouter();
    const { logoutUser, getUserProfile, updateProfile } = useUserStore();
    const [userData, setUserData] = useState({ 
        name: "", 
        email: "", 
        role: "", 
        id: "",
        profilePicture: ""
    });
    const [isAdmin, setIsAdmin] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const fileInputRef = useRef(null);
    const [profileLoaded, setProfileLoaded] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("user_login_token");
        
        if (token) {
            try {
                const decoded = jwt.decode(token);
                setUserData({
                    name: decoded?.username || "Not Available",
                    email: decoded?.email || "Not Available",
                    role: decoded?.role || "Not Available",
                    id: decoded?.userId || "Not Available",
                    profilePicture: ""
                });
                setIsAdmin(decoded?.role === "admin");
                console.log("Decoded token:", decoded);
                console.log("User ID:", decoded?.userId);
                
                loadUserProfile();
            } catch (error) {
                console.error("Error decoding token:", error);
            }
        } else {
            router.push("/login");
        }
    }, [router]);

    const loadUserProfile = async () => {
        const result = await getUserProfile();
        if (result.success) {
            setUserData(prevData => ({
                ...prevData,
                profilePicture: result.data.profilePicture || ""
            }));
            setProfileLoaded(true);
        } else {
            console.error("Failed to load profile:", result.message);
        }
    };
    
    const handleLogout = () => {
        const result = logoutUser();
        if (result.success) {
            location.reload();
            router.push("/login");
        }
    };

    const handleProfilePictureClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setMessage({ 
                type: 'error', 
                text: 'Please upload a valid image file (JPEG, PNG, GIF, or WEBP)'
            });
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setMessage({ 
                type: 'error', 
                text: 'Image size too large. Please upload an image smaller than 5MB.'
            });
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            return;
        }
        
        setIsUploading(true);
        setMessage({ type: '', text: '' });
        
        try {
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                const base64Image = e.target?.result;
                
                const img = new Image();
                img.onload = async () => {
                    let imageData = base64Image;

                    if (img.width > 1200 || img.height > 1200) {
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;
                        
                        if (width > height && width > 1200) {
                            height = Math.round((height * 1200) / width);
                            width = 1200;
                        } else if (height > 1200) {
                            width = Math.round((width * 1200) / height);
                            height = 1200;
                        }
                        
                        canvas.width = width;
                        canvas.height = height;
                        
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        imageData = canvas.toDataURL(file.type, 0.8);
                    }
                    
                    const result = await updateProfile({
                        profilePicture: imageData
                    });
                    
                    if (result.success) {
                        setUserData(prev => ({
                            ...prev,
                            profilePicture: imageData
                        }));
                        setMessage({ 
                            type: 'success', 
                            text: 'Profile picture updated successfully'
                        });
                    } else {
                        setMessage({ 
                            type: 'error', 
                            text: result.message || 'Failed to update profile picture'
                        });
                    }
                    
                    setIsUploading(false);
                    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
                };
                
                img.src = base64Image;
            };
            
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error uploading image:', error);
            setMessage({ 
                type: 'error', 
                text: 'Error processing image. Please try again.'
            });
            setIsUploading(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
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
              
              {message.text && (
                <div className={`mb-6 p-3 rounded-lg ${
                  message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {message.text}
                </div>
              )}
              
              <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
                <div 
                  className="relative cursor-pointer group" 
                  onClick={handleProfilePictureClick}
                >
                  <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-[#3c6ca8]/20 flex items-center justify-center bg-[#e9f0f9]">
                    {userData.profilePicture ? (
                      <img 
                        src={userData.profilePicture} 
                        alt={userData.name} 
                        className="h-full w-full object-cover"
                      />
                    ) : profileLoaded ? (
                      <div className="flex flex-col items-center justify-center text-[#3c6ca8]/40">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-xs mt-1">No Photo</span>
                      </div>
                    ) : (
                      <div className="animate-pulse h-full w-full bg-gray-200"></div>
                    )}
                  </div>
                  
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-white text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                      </svg>
                      <span className="text-xs">Update Photo</span>
                    </div>
                  </div>
                  
                  {isUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-70 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                    </div>
                  )}
                  
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/jpeg, image/png, image/gif, image/webp"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                </div>
                
                <div className="flex flex-col space-y-2">
                  <h3 className="text-xl font-medium text-center md:text-left">{userData.name}</h3>
                  <p className="text-[#3c6ca8]/70 text-center md:text-left">{userData.email}</p>
                  <div className="flex justify-center md:justify-start">
                    <span className="inline-block px-3 py-1 text-sm rounded-full bg-[#edf3fa] text-[#3c6ca8] font-semibold">
                      {userData.role}
                    </span>
                  </div>
                </div>
              </div>
              
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
              
              {isAdmin && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Admin Section
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-r from-[#3c6ca8]/10 to-[#3c6ca8]/5 p-5 rounded-lg shadow-sm border border-[#3c6ca8]/20 hover:shadow-md transition-shadow">
                      <p className="text-sm text-[#3c6ca8]/70 mb-2 uppercase tracking-wider font-medium">Admin ID</p>
                      <p className="text-lg font-medium flex items-center">
                        <span className="inline-block px-3 py-1 mr-2 text-sm rounded-md bg-[#3c6ca8] text-white font-semibold">
                          {userData.id}
                        </span>
                        <span className="text-[#3c6ca8]/60 text-sm">Privileged Access</span>
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-[#3c6ca8]/10 to-[#3c6ca8]/5 p-5 rounded-lg shadow-sm border border-[#3c6ca8]/20 hover:shadow-md transition-shadow">
                      <p className="text-sm text-[#3c6ca8]/70 mb-2 uppercase tracking-wider font-medium">Admin Controls</p>
                      <button className="px-4 py-2 bg-[#3c6ca8] text-white rounded-lg hover:bg-[#2a5080] transition-colors font-medium text-sm flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                        Access Admin Panel
                      </button>
                    </div>
                  </div>
                </div>
              )}
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