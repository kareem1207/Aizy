'use client';
import { useUserStore } from '@/store/userStore';
import jwt from "jsonwebtoken";
import { useState, useEffect } from 'react';
import OTPMail from './OTPMail';

export const OTP = ({ setUserValid, userInfo }) => {
    const [otpUser, setUserOtp] = useState('');
    const [otp, setOtp] = useState('');
    const [showOTPMail, setShowOTPMail] = useState(false);
    const { generateOtp } = useUserStore();

    useEffect(() => {
        console.log("OTP component userInfo:", userInfo);
    }, [userInfo]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (otpUser.length !== 6) {
            alert("Please enter a valid OTP!");
            return;
        }
        if (otpUser !== otp) {
            alert("Invalid OTP!");
            return;
        } else {
            alert("OTP verified successfully!");
            setUserValid(true);
        }
    }

    const handleOTPGenerate = async (e) => {
        e.preventDefault();
        try {
            const res = await generateOtp();
            console.log("OTP generation response:", res);
            if (res.success) {
                const otpDecoded = jwt.decode(res.data.data);
                console.log("Generated OTP:", otpDecoded);
                
                // Convert OTP to string
                const otpString = String(otpDecoded.otp);
                setOtp(otpString);
                setShowOTPMail(true);
            } else {
                alert(res.message || "Failed to generate OTP");
            }
        } catch (error) {
            console.error("Error generating OTP:", error);
            alert("Failed to generate OTP. Please try again.");
        }
    }

    const userEmail = typeof userInfo === 'string' ? userInfo : (userInfo?.email || '');

    return (
        <div className="space-y-6">
            {/* Always show the OTP generation form if no OTP yet */}
            {!otp && (
                <form onSubmit={handleOTPGenerate} className="flex flex-col gap-4">
                    <p className='text-[#3c6ca8] font-medium mb-2'>Generate OTP to verify your account</p>
                    <button 
                        type="submit" 
                        className='w-full bg-[#3c6ca8] hover:bg-[#3c6ca8]/80 text-[#fffcf6] py-3 rounded-lg transition duration-200'
                    >
                        Generate OTP
                    </button>
                </form>
            )}
            
            {showOTPMail && otp && (
                <div className="mb-6">
                    <OTPMail otp={otp} email={userEmail} />
                </div>
            )}

            {otp && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <label htmlFor="otp" className='text-[#3c6ca8] font-medium mb-2'>
                        Enter the 6-digit OTP sent to your email:
                    </label>
                    <input 
                        type="text" 
                        id="otp" 
                        name="otp" 
                        className='w-full px-4 py-3 rounded-lg border border-[#3c6ca8]/30 focus:outline-none focus:ring-2 focus:ring-[#3c6ca8] text-[#3c6ca8] bg-[#fffcf6]' 
                        onChange={(e) => setUserOtp(e.target.value)} 
                        maxLength={6}
                        placeholder="Enter 6-digit OTP"
                        required
                    />
                    <button 
                        type="submit" 
                        className='w-full bg-[#3c6ca8] hover:bg-[#3c6ca8]/80 text-[#fffcf6] py-3 rounded-lg transition duration-200'
                    >
                        Verify OTP
                    </button>
                </form>
            )}
        </div>
    );
}