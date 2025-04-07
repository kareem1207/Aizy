import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from '@/components/SearchBar';

describe('SearchBar Component', () => {
  it('renders correctly', () => {
    render(<SearchBar />);
    
    // Check if search input is present
    const searchInput = screen.getByPlaceholderText('Search for products, brands and more');
    expect(searchInput).toBeInTheDocument();
    
    // Check if search button is present
    const searchButton = screen.getByText('Search');
    expect(searchButton).toBeInTheDocument();
  });

  it('allows typing in the search field', () => {
    render(<SearchBar />);
    
    const searchInput = screen.getByPlaceholderText('Search for products, brands and more');
    
    // Simulate typing in the search box
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    // Check if the input value has changed
    expect(searchInput.value).toBe('test search');
  });

  it('has correct styling for the search button', () => {
    render(<SearchBar />);
    
    const searchButton = screen.getByText('Search').closest('button');
    
    // Check if the button has the correct color classes
    expect(searchButton).toHaveClass('bg-[#3c6ca8]');
    expect(searchButton).toHaveClass('hover:bg-[#2c5f8c]');
    expect(searchButton).toHaveClass('text-white');
  });
});
