import Image from "next/image";

export const Card = ({ card }) => {
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-6">
            {card.map((item, index) => (
                <div 
                    key={index} 
                    className="group relative flex flex-col bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                    <div className="relative w-full pt-[100%] bg-gray-100 overflow-hidden">
                        <Image
                            src={item.image}
                            alt={item.name}
                            layout="fill"
                            objectFit="cover"
                            className="group-hover:scale-110 transition-transform duration-300"
                        />
                    </div>
                    
                    <div className="p-6 flex flex-col gap-3">
                        <h2 className="text-xl font-semibold text-gray-800 line-clamp-1">
                            {item.name}
                        </h2>
                        
                        <div className="flex items-center justify-between">
                            <p className="text-2xl font-bold text-indigo-600">
                                ₹{item.price}
                            </p>
                            <div className="flex items-center gap-1">
                                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                <span className="font-semibold text-gray-700">{item.rating}</span>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-2">
                            <button className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors p-2">
                                Add to Cart
                            </button>
                            <button className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-indigo-600 hover:text-indigo-600 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};