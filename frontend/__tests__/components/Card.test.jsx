import React from 'react';
import { render, screen } from '@testing-library/react';
import { Card } from '@/components/Card';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe('Card Component', () => {
  const mockProducts = [
    {
      id: '1',
      name: 'Test Product',
      price: 99.99,
      rating: 4.5,
      image: '/test-image.jpg',
    },
    {
      id: '2',
      name: 'Another Product',
      price: 49.99,
      rating: 4.0,
      image: '/another-image.jpg',
    },
  ];

  it('renders products correctly', () => {
    render(<Card card={mockProducts} />);
    
    // Check if product names are rendered
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Another Product')).toBeInTheDocument();
    
    // Check if prices are rendered correctly
    expect(screen.getByText('₹99.99')).toBeInTheDocument();
    expect(screen.getByText('₹49.99')).toBeInTheDocument();
    
    // Check for ratings
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('4.0')).toBeInTheDocument();
    
    // Check for buttons
    const addToCartButtons = screen.getAllByText('Add to Cart');
    expect(addToCartButtons).toHaveLength(2);
  });

  it('renders nothing when no products are provided', () => {
    const { container } = render(<Card card={[]} />);
    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it('handles undefined card prop gracefully', () => {
    const { container } = render(<Card />);
    expect(container.firstChild).toBeEmptyDOMElement();
  });
});
