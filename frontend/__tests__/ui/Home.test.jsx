import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Home from '@/ui/Home';
import { useProductStore } from '@/store/productStore';

// Mock the Card component
jest.mock('@/components/Card', () => ({
  Card: ({ card }) => (
    <div data-testid="card-component">
      {card?.map(item => (
        <div key={item._id || item.id}>Product: {item.name}</div>
      ))}
    </div>
  )
}));

// Mock the store
jest.mock('@/store/productStore', () => ({
  useProductStore: jest.fn()
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe('Home Component', () => {
  const mockProducts = [
    { _id: '1', name: 'Product 1', price: 99.99 },
    { _id: '2', name: 'Product 2', price: 49.99 }
  ];

  beforeEach(() => {
    // Mock implementation for getProducts
    const mockGetProducts = jest.fn().mockResolvedValue({
      data: mockProducts
    });
    
    useProductStore.mockImplementation(() => ({
      getProducts: mockGetProducts
    }));
  });

  it('renders loading state initially', () => {
    render(<Home />);
    
    // Check if welcome message is displayed
    expect(screen.getByText('Welcome to')).toBeInTheDocument();
    expect(screen.getByText('Aizy')).toBeInTheDocument();
    
    // Check if loading animation is displayed
    const loadingElement = document.querySelector('.animate-spin');
    expect(loadingElement).toBeInTheDocument();
  });

  it('renders products after loading', async () => {
    render(<Home />);
    
    // Check if Card component is rendered with products after loading
    await waitFor(() => {
      expect(screen.getByTestId('card-component')).toBeInTheDocument();
    });
  });

  it('handles error case gracefully', async () => {
    // Mock implementation for a failed request
    useProductStore.mockImplementation(() => ({
      getProducts: jest.fn().mockRejectedValue(new Error('Failed to fetch'))
    }));
    
    render(<Home />);
    
    // Check that the component doesn't crash and eventually completes loading
    await waitFor(() => {
      expect(screen.getByTestId('card-component')).toBeInTheDocument();
    });
  });
});
