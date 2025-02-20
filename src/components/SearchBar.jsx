export const SearchBar = () => {
    return (
        <div className="flex items-center w-full">
            <div className="relative flex items-center flex-1 h-12 bg-gray-50 rounded-xl overflow-hidden hover:bg-gray-100 transition-colors group focus-within:ring-2 focus-within:ring-indigo-200">
                <input 
                    type="text" 
                    placeholder="Search for products, brands and more" 
                    className="w-full h-full px-5 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                />
                <button 
                    type="submit"
                    className="h-full px-6 bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search
                </button>
            </div>
        </div>
    );
};