"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useUserStore } from '@/store/userStore';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const { loginUser, createUser } = useUserStore();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        userType: 'customer'
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState('');
    

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            if (isLogin) {
                const result = await loginUser(formData);
                if (result.success) {
                    setSuccess(result.message);
                } else {
                    setError(result.message);
                }
                console.log('Login attempt:', { email: formData.email, password: formData.password, userType: formData.userType });
            } else {
                if (formData.password !== formData.confirmPassword) {
                    setError('Passwords do not match');
                    setIsLoading(false);
                    return;
                }
                
                const result = await createUser(formData);
                if (result.success) {
                    setSuccess(result.message);
                } else {
                    setError(result.message);
                }
                console.log('Signup attempt:', formData);
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            console.error('Form submission error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return <>
        <div className="min-h-screen flex items-center justify-center bg-[#fffcf6]">
            <div className="w-full max-w-md p-8 rounded-lg shadow-lg bg-[#fffcf6]">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-[#3c6ca8]">Aizy</h1>
                    <p className="text-[#3c6ca8] mt-2">
                        {isLogin ? 'Sign in to your account' : 'Create a new account'}
                    </p>
                </div>
                
                <div className="flex mb-6">
                    <button 
                        onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }} 
                        className={`flex-1 py-2 text-center ${isLogin ? 'text-[#3c6ca8] border-b-2 border-[#3c6ca8]' : 'text-[#3c6ca8]/50'}`}
                    >
                        Login
                    </button>
                    <button 
                        onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }} 
                        className={`flex-1 py-2 text-center ${!isLogin ? 'text-[#3c6ca8] border-b-2 border-[#3c6ca8]' : 'text-[#3c6ca8]/50'}`}
                    >
                        Sign Up
                    </button>
                </div>
                
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}
                
                {success && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                        {success}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-[#3c6ca8] mb-2">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-[#3c6ca8]/30 focus:outline-none focus:ring-2 focus:ring-[#3c6ca8] text-[#3c6ca8] bg-[#fffcf6]"
                                required={!isLogin}
                                disabled={isLoading}
                            />
                        </div>
                    )}
                    
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-[#3c6ca8] mb-2">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-[#3c6ca8]/30 focus:outline-none focus:ring-2 focus:ring-[#3c6ca8] text-[#3c6ca8] bg-[#fffcf6]"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-[#3c6ca8] mb-2">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-[#3c6ca8]/30 focus:outline-none focus:ring-2 focus:ring-[#3c6ca8] text-[#3c6ca8] bg-[#fffcf6]"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    
                    {!isLogin && (
                        <div className="mb-4">
                            <label htmlFor="confirmPassword" className="block text-[#3c6ca8] mb-2">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-[#3c6ca8]/30 focus:outline-none focus:ring-2 focus:ring-[#3c6ca8] text-[#3c6ca8] bg-[#fffcf6]"
                                required={!isLogin}
                                disabled={isLoading}
                            />
                        </div>
                    )}
                    
                    <div className="mb-4 relative">
                        <label htmlFor="userType" className="block text-[#3c6ca8] mb-2">User Type</label>
                        <select
                            id="userType"
                            name="userType"
                            value={formData.userType}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-[#3c6ca8]/30 focus:outline-none focus:ring-2 focus:ring-[#3c6ca8] text-[#3c6ca8] bg-[#fffcf6] appearance-none"
                            required
                            disabled={isLoading}
                        >
                            <option value="customer">Customer</option>
                            <option value="admin">Admin</option>
                            <option value="seller">Seller</option>
                        </select>
                        <div className="pointer-events-none absolute right-0 top-1/2 mt-2 flex items-center px-2 text-[#3c6ca8]">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>
                    
                    {isLogin && (
                        <div className="flex justify-end mb-6">
                            <Link href="/forgot-password" className="text-sm text-[#3c6ca8] hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                    )}
                    
                    <button
                        type="submit"
                        className={`w-full bg-[#3c6ca8] hover:bg-[#3c6ca8]/80 text-[#fffcf6] py-3 rounded-lg transition duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>
                
                <div className="mt-8 text-center">
                    <div className="relative flex items-center justify-center">
                        <div className="border-t border-[#3c6ca8]/30 flex-grow"></div>
                        <span className="px-4 text-sm text-[#3c6ca8]">Or continue with</span>
                        <div className="border-t border-[#3c6ca8]/30 flex-grow"></div>
                    </div>
                    
                    <div className="flex justify-center gap-4 mt-4">
                        <button className="p-2 rounded-full border border-[#3c6ca8]/30 hover:bg-[#e8f0fe] text-[#3c6ca8]">
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                            </svg>
                        </button>
                        <button className="p-2 rounded-full border border-[#3c6ca8]/30 hover:bg-[#e8f0fe] text-[#3c6ca8]">
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M22.675 0H1.325C0.593 0 0 0.593 0 1.325v21.351C0 23.407 0.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463 0.099 2.795 0.143v3.24l-1.918 0.001c-1.504 0-1.795 0.715-1.795 1.763v2.313h3.587l-0.467 3.622h-3.12V24h6.116c0.73 0 1.323-0.593 1.323-1.325V1.325C24 0.593 23.407 0 22.675 0z" />
                            </svg>
                        </button>
                        <button className="p-2 rounded-full border border-[#3c6ca8]/30 hover:bg-[#e8f0fe] text-[#3c6ca8]">
                            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </>
};

export default Login;