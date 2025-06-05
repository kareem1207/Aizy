import { useAIStore } from "@/store/aiStore.js";
import { useState } from "react";
import { AiOutlineHeart, AiFillHeart, AiOutlineCopy, AiOutlineClose } from "react-icons/ai";
import { BsStars } from "react-icons/bs";

export const Chat = ({ close }) => {
    const [fashionPrompt, setFashionPrompt] = useState("");
    const [fashionRecommendation, setFashionRecommendation] = useState(null);
    const [error, setError] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { getFashionRecommendation } = useAIStore();

    const commonPrompts = [
        "Suggest an outfit for a girl to wear on a wedding",
        "Casual office wear ideas", 
        "Date night outfit for boy",
        "Festival ethnic wear for girl",
        "Summer vacation clothes for girl"
    ];

    const handleFashionSubmit = async (e) => {
        e.preventDefault();
        if (!fashionPrompt.trim()) return;
        
        setIsLoading(true);
        try {
            const recommendation = await getFashionRecommendation(fashionPrompt);
            setFashionRecommendation(recommendation);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePromptClick = (prompt) => {
        setFashionPrompt(prompt);
    };

    const handleLike = () => {
        setIsLiked(!isLiked);
    };

    const handleCopy = async () => {
        if (fashionRecommendation) {
            try {
                await navigator.clipboard.writeText(fashionRecommendation);
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
            } catch (err) {
                console.error('Failed to copy text: ', err);
            }
        }
    };

    const handleClose = () => {
        close(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 p-1 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slideUp">
                <div className="bg-white rounded-xl p-6 h-full overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <BsStars className="text-2xl text-purple-500" />
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                AI Fashion Assistant
                            </h1>
                        </div>
                        <button 
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                        >
                            <AiOutlineClose className="text-xl text-gray-600" />
                        </button>
                    </div>

                    {/* Common Prompts */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Quick Prompts:</h3>
                        <div className="flex flex-wrap gap-2">
                            {commonPrompts.map((prompt, index) => (
                                <button
                                    key={index}
                                    onClick={() => handlePromptClick(prompt)}
                                    className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-full text-sm font-medium hover:from-cyan-500 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input Form */}
                    <form onSubmit={handleFashionSubmit} className="mb-6">
                        <div className="relative">
                            <input
                                type="text"
                                value={fashionPrompt}
                                onChange={(e) => setFashionPrompt(e.target.value)}
                                placeholder="Enter your fashion prompt or click a suggestion above..."
                                className="w-full p-4 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:border-purple-400 focus:outline-none transition-colors duration-200"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={isLoading || !fashionPrompt.trim()}
                            className="w-full mt-4 py-3 bg-gradient-to-r from-orange-400 to-pink-500 text-white font-semibold rounded-xl hover:from-orange-500 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Generating...
                                </div>
                            ) : (
                                "✨ Get Fashion Recommendation"
                            )}
                        </button>
                    </form>

                    {/* Recommendation Display */}
                    {fashionRecommendation && (
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200 animate-fadeIn">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-gray-700">Your Fashion Recommendation:</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleLike}
                                        className={`p-2 rounded-full transition-all duration-200 ${
                                            isLiked 
                                                ? 'bg-red-100 text-red-500 scale-110' 
                                                : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-400'
                                        }`}
                                    >
                                        {isLiked ? <AiFillHeart className="text-xl" /> : <AiOutlineHeart className="text-xl" />}
                                    </button>
                                    <button
                                        onClick={handleCopy}
                                        className={`p-2 rounded-full transition-all duration-200 ${
                                            copySuccess
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-500'
                                        }`}
                                    >
                                        <AiOutlineCopy className="text-xl" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-gray-800 leading-relaxed">{fashionRecommendation}</p>
                            {copySuccess && (
                                <p className="mt-2 text-green-600 text-sm font-medium animate-pulse">
                                    ✅ Copied to clipboard!
                                </p>
                            )}
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 p-4 rounded-xl animate-fadeIn">
                            <p className="text-red-600 font-medium">❌ Error: {error}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};