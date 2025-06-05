"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'next/navigation';
import { OTP } from '@/components/OTP';

const Login = () => {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const { loginUser, createUser, generateToken } = useUserStore();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        userType: 'customer'
    });
    const [error, setError] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [showOtpFirst, setShowOtpFirst] = useState(false);
    const [verifiedUser, setVerifiedUser] = useState(false);
    

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        if (isValid && showOtpFirst) {
            setVerifiedUser(true);
            setShowOtpFirst(false);
            handleVerifiedSubmit();
        }
    }, [isValid]);

    const handleVerifiedSubmit = async () => {
        setIsLoading(true);
        try {
            if (isLogin) {
                const result = await loginUser(formData);
                if (result.success) {
                    setSuccess(result.message);
                    await generateToken(formData); 
                    router.push('/user');
                } else {
                    setError(result.message);
                }
            } else {
                const result = await createUser(formData);
                if (result.success) {
                    setSuccess(result.message);
                    await generateToken(formData);
                    router.push('/user');
                } else {
                    setError(result.message);
                }
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            console.error('Form submission error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!isLogin && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        if (verifiedUser) {
            handleVerifiedSubmit();
        } else {
            setShowOtpFirst(true);
        }
    };

    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-[#fffcf6] p-8">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <h1 className="text-7xl font-black text-[#3c6ca8] tracking-wider" style={{ 
                            fontFamily: 'Arial Black, Helvetica, sans-serif',
                            fontWeight: '900',
                            letterSpacing: '0.1em',
                            textShadow: '2px 2px 4px rgba(60, 108, 168, 0.3)'
                        }}>
                            AIZY
                        </h1>
                    </div>
                    
                    {/* Login Form */}
                    <div className="bg-white/30 backdrop-blur-sm rounded-lg p-6 border border-[#3c6ca8]/20">
                        {/* Login/Signup Toggle */}
                        <div className="flex mb-6 bg-[#3c6ca8]/10 rounded-md p-1">
                            <button 
                                onClick={() => { setIsLogin(true); setError(''); setSuccess(''); setShowOtpFirst(false); setVerifiedUser(false); }} 
                                className={`flex-1 py-2 px-4 rounded-sm text-center transition-all ${isLogin ? 'bg-[#3c6ca8] text-white' : 'text-[#3c6ca8]'}`}
                            >
                                Login
                            </button>
                            <button 
                                onClick={() => { setIsLogin(false); setError(''); setSuccess(''); setShowOtpFirst(false); setVerifiedUser(false); }} 
                                className={`flex-1 py-2 px-4 rounded-sm text-center transition-all ${!isLogin ? 'bg-[#3c6ca8] text-white' : 'text-[#3c6ca8]'}`}
                            >
                                Sign Up
                            </button>
                        </div>
                        
                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                                {error}
                            </div>
                        )}
                        
                        {success && (
                            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                                {success}
                            </div>
                        )}
                        
                        {showOtpFirst ? (
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-[#3c6ca8] mb-4">
                                    Verify Your Identity
                                </h2>
                                <OTP setUserValid={setIsValid} userInfo={formData} />
                                <button
                                    onClick={() => setShowOtpFirst(false)}
                                    className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-[#3c6ca8] py-3 rounded-lg transition duration-200"
                                >
                                    Back
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {!isLogin && (
                                    <div>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            placeholder="Name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-4 rounded-lg border border-[#3c6ca8]/30 focus:outline-none focus:ring-2 focus:ring-[#3c6ca8] text-[#3c6ca8] bg-[#fffcf6]/80 placeholder-[#3c6ca8]/60"
                                            required={!isLogin}
                                            disabled={isLoading}
                                        />
                                    </div>
                                )}
                                
                                <div>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="Email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-4 rounded-lg border border-[#3c6ca8]/30 focus:outline-none focus:ring-2 focus:ring-[#3c6ca8] text-[#3c6ca8] bg-[#fffcf6]/80 placeholder-[#3c6ca8]/60"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                
                                <div>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-4 py-4 rounded-lg border border-[#3c6ca8]/30 focus:outline-none focus:ring-2 focus:ring-[#3c6ca8] text-[#3c6ca8] bg-[#fffcf6]/80 placeholder-[#3c6ca8]/60"
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                                
                                {!isLogin && (
                                    <div>
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            placeholder="Confirm Password"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full px-4 py-4 rounded-lg border border-[#3c6ca8]/30 focus:outline-none focus:ring-2 focus:ring-[#3c6ca8] text-[#3c6ca8] bg-[#fffcf6]/80 placeholder-[#3c6ca8]/60"
                                            required={!isLogin}
                                            disabled={isLoading}
                                        />
                                    </div>
                                )}
                                
                                <div className="relative">
                                    <select
                                        id="userType"
                                        name="userType"
                                        value={formData.userType}
                                        onChange={handleChange}
                                        className="w-full px-4 py-4 rounded-lg border border-[#3c6ca8]/30 focus:outline-none focus:ring-2 focus:ring-[#3c6ca8] text-[#3c6ca8] bg-[#fffcf6]/80 appearance-none"
                                        required
                                        disabled={isLoading}
                                    >
                                        <option value="customer">Customer</option>
                                        {isLogin && <option value="admin">Admin</option>}
                                        <option value="seller">Seller</option>
                                    </select>
                                    <div className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2 text-[#3c6ca8]">
                                        <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                        </svg>
                                    </div>
                                </div>
                                
                                {isLogin && (
                                    <div className="flex justify-end">
                                        <Link href="/forgot-password" className="text-sm text-[#3c6ca8] hover:underline">
                                            Forgot password?
                                        </Link>
                                    </div>
                                )}
                                
                                <button
                                    type="submit"
                                    className={`w-full bg-[#3c6ca8] hover:bg-[#3c6ca8]/90 text-white py-3 rounded-md transition duration-200 font-semibold ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    disabled={isLoading}
                                >
                                    {isLoading 
                                        ? 'Processing...' 
                                        : verifiedUser 
                                            ? isLogin ? 'Login Now' : 'Create Account Now' 
                                            : 'Proceed'
                                    }
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;