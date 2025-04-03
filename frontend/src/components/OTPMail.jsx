import { useState, useEffect } from 'react';

const OTPMail = ({ otp, email }) => {
    const [isSending, setIsSending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (email && otp) {
            sendOTPEmail(email, otp);
        }
    }, [email, otp]);

    const sendOTPEmail = async (to, otpCode) => {
        setIsSending(true);
        setError(null);
        
        try {
            console.log("Sending OTP email to:", to);
            
            const response = await fetch('/api/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: to,
                    otp: otpCode
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                console.log("Email sent successfully with ID:", data.messageId);
                setIsSuccess(true);
            } else {
                throw new Error(data.error || "Failed to send email");
            }
        } catch (error) {
            console.error("Error sending email:", error);
            setError("Failed to send verification email. Please try again.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="bg-[#fffcf6] text-[#3c6ca8] p-4 rounded-lg border border-[#3c6ca8]/20 mb-4">
            {isSending && (
                <div className="bg-blue-50 p-3 rounded-md mb-3">
                    <p className="text-blue-700">Sending verification code to your email...</p>
                </div>
            )}
            
            {isSuccess && (
                <div className="bg-green-50 p-3 rounded-md mb-3">
                    <p className="text-green-700">Verification code sent successfully! Please check your email.</p>
                </div>
            )}
            
            {error && (
                <div className="bg-red-50 p-3 rounded-md mb-3">
                    <p className="text-red-700">{error}</p>
                </div>
            )}
            
            <p className="mb-2">Your OTP is: <span className="font-semibold">{otp}</span></p>
            <p className="text-sm text-gray-600">Please enter this OTP in the form to verify your email.</p>
        </div>
    );
};

export default OTPMail;