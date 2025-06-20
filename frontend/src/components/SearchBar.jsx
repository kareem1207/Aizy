import { useState } from 'react';

export const SearchBar = ({ onSearch, placeholder = "Search for products, brands and more" }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (onSearch && typeof onSearch === 'function') {
            onSearch(searchQuery);
        }
    };

    const handleInputChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (onSearch && typeof onSearch === 'function') {
            onSearch(query);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        if (onSearch && typeof onSearch === 'function') {
            onSearch('');
        }
    };

    return (
        <div className="flex items-center w-full">
            <form onSubmit={handleSearch} className="relative flex items-center flex-1 h-12 bg-gray-50 rounded-xl overflow-hidden hover:bg-gray-100 transition-colors group focus-within:ring-2 focus-within:ring-indigo-200">
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className="w-full h-full px-5 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                />
                
                {searchQuery && (
                    <button 
                        type="button"
                        onClick={clearSearch}
                        className="px-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
                
                <button 
                    type="submit"
                    className="h-full px-6 bg-[#3c6ca8] hover:bg-[#2c5f8c] text-white font-medium transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search
                </button>
            </form>
        </div>
    );
};