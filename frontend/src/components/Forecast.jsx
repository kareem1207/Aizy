import { useAIStore } from "@/store/aiStore.js";
import { useState } from "react";
import { AiOutlineBarChart, AiOutlineLineChart, AiOutlineRise, AiOutlineClose } from "react-icons/ai";
import { BsGraphUp, BsCurrencyDollar } from "react-icons/bs";

export const Forecast = ({ onClose }) => {
    const { getSalesForecast } = useAIStore();
    const [salesForecast, setSalesForecast] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSalesForecast = async () => {
        setIsLoading(true);
        try {
            const forecast = await getSalesForecast();
            setSalesForecast(forecast);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const getTopProducts = (data, key, limit = 5) => {
        return Object.entries(data)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <BsGraphUp className="text-2xl" />
                            <h2 className="text-2xl font-bold">Sales Forecast Analysis</h2>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
                        >
                            <AiOutlineClose className="text-xl" />
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                    {!salesForecast && !error && (
                        <div className="text-center py-12">
                            <BsGraphUp className="text-6xl text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">Generate Sales Forecast</h3>
                            <p className="text-gray-500 mb-6">Get AI-powered insights about your sales performance and future predictions</p>
                            <button 
                                onClick={handleSalesForecast}
                                disabled={isLoading}
                                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Analyzing...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <AiOutlineBarChart className="text-xl" />
                                        Generate Forecast
                                    </div>
                                )}
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-center">
                            <div className="text-red-600 text-4xl mb-4">⚠️</div>
                            <h3 className="text-lg font-semibold text-red-800 mb-2">Analysis Error</h3>
                            <p className="text-red-600 mb-4">{error}</p>
                            <button 
                                onClick={handleSalesForecast}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {salesForecast && (
                        <div className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-6 rounded-xl">
                                    <div className="flex items-center gap-3 mb-3">
                                        <BsCurrencyDollar className="text-2xl text-green-600" />
                                        <h3 className="font-semibold text-green-800">Revenue Forecast</h3>
                                    </div>
                                    <p className="text-2xl font-bold text-green-700">
                                        {formatCurrency(Object.values(salesForecast.sales_forecasts || {}).reduce((a, b) => a + b, 0))}
                                    </p>
                                    <p className="text-sm text-green-600">Next {salesForecast.months_forecasted || 3} months</p>
                                </div>

                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 rounded-xl">
                                    <div className="flex items-center gap-3 mb-3">
                                        <AiOutlineRise className="text-2xl text-blue-600" />
                                        <h3 className="font-semibold text-blue-800">Profit Forecast</h3>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-700">
                                        {formatCurrency(Object.values(salesForecast.profit_forecasts || {}).reduce((a, b) => a + b, 0))}
                                    </p>
                                    <p className="text-sm text-blue-600">Projected earnings</p>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 p-6 rounded-xl">
                                    <div className="flex items-center gap-3 mb-3">
                                        <AiOutlineLineChart className="text-2xl text-purple-600" />
                                        <h3 className="font-semibold text-purple-800">Top Performer</h3>
                                    </div>
                                    <p className="text-lg font-bold text-purple-700">
                                        {salesForecast.best_overall_product || 'N/A'}
                                    </p>
                                    <p className="text-sm text-purple-600">Best overall product</p>
                                </div>
                            </div>

                            {/* Top Products Analysis */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Top Sales Products */}
                                <div className="bg-gray-50 p-6 rounded-xl border">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <AiOutlineBarChart className="text-blue-600" />
                                        Top Sales Forecast
                                    </h3>
                                    <div className="space-y-3">
                                        {getTopProducts(salesForecast.sales_forecasts || {}, 'sales').map(([product, value], index) => (
                                            <div key={product} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                                                    }`}>
                                                        {index + 1}
                                                    </span>
                                                    <span className="font-medium text-gray-700 truncate">{product}</span>
                                                </div>
                                                <span className="font-bold text-green-600">{formatCurrency(value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Top Profit Products */}
                                <div className="bg-gray-50 p-6 rounded-xl border">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                        <BsCurrencyDollar className="text-green-600" />
                                        Top Profit Forecast
                                    </h3>
                                    <div className="space-y-3">
                                        {getTopProducts(salesForecast.profit_forecasts || {}, 'profit').map(([product, value], index) => (
                                            <div key={product} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                                <div className="flex items-center gap-3">
                                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                                                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                                                    }`}>
                                                        {index + 1}
                                                    </span>
                                                    <span className="font-medium text-gray-700 truncate">{product}</span>
                                                </div>
                                                <span className="font-bold text-blue-600">{formatCurrency(value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Analysis Graphs */}
                            <div className="bg-gray-50 p-6 rounded-xl border">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <AiOutlineLineChart className="text-purple-600" />
                                    Visual Analysis
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-lg border text-center">
                                        <img 
                                            src={salesForecast.plot_urls?.comprehensive_analysis || "/api/placeholder/400/300"}
                                            alt="Comprehensive Seller Analysis" 
                                            className="w-full h-48 object-contain rounded-lg mb-2"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'block';
                                            }}
                                        />
                                        <div className="hidden">
                                            <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                                                <div className="text-center">
                                                    <AiOutlineBarChart className="text-4xl text-gray-400 mx-auto mb-2" />
                                                    <p className="text-gray-500">Comprehensive Analysis Chart</p>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm font-medium text-gray-600">Overall Performance Analysis</p>
                                    </div>
                                    
                                    <div className="bg-white p-4 rounded-lg border text-center">
                                        <img 
                                            src={salesForecast.plot_urls?.detailed_analysis || "/api/placeholder/400/300"}
                                            alt="Product Detail Analysis" 
                                            className="w-full h-48 object-contain rounded-lg mb-2"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'block';
                                            }}
                                        />
                                        <div className="hidden">
                                            <div className="w-full h-48 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                                                <div className="text-center">
                                                    <AiOutlineLineChart className="text-4xl text-gray-400 mx-auto mb-2" />
                                                    <p className="text-gray-500">Detailed Product Analysis</p>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm font-medium text-gray-600">Best Product Detailed View</p>
                                    </div>
                                </div>
                            </div>

                            {/* Recommendations */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 AI Recommendations</h3>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <span className="text-green-500 text-xl">✅</span>
                                        <p className="text-gray-700">Focus marketing efforts on <strong>{salesForecast.best_overall_product}</strong> - your highest potential product</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-blue-500 text-xl">📈</span>
                                        <p className="text-gray-700">Expected revenue growth of <strong>{formatCurrency(Object.values(salesForecast.sales_forecasts || {}).reduce((a, b) => a + b, 0))}</strong> in the next {salesForecast.months_forecasted || 3} months</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-purple-500 text-xl">💡</span>
                                        <p className="text-gray-700">Consider increasing inventory for top-performing products to meet projected demand</p>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center pt-4">
                                <button 
                                    onClick={handleSalesForecast}
                                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
                                >
                                    🔄 Refresh Analysis
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};