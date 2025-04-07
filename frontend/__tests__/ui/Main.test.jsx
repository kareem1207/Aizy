import React from 'react';
import { render, screen } from '@testing-library/react';
import { Main } from '@/ui/Main';
import jwt from 'jsonwebtoken';

// Mock the role-based components
jest.mock('@/ui/Seller', () => ({
  Seller: () => <div data-testid="seller-component">Seller Dashboard</div>
}));

jest.mock('@/ui/Admin', () => ({
  Admin: () => <div data-testid="admin-component">Admin Dashboard</div>
}));

jest.mock('@/ui/Home', () => ({
  __esModule: true,
  default: () => <div data-testid="customer-component">Customer Dashboard</div>
}));

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  decode: jest.fn()
}));

describe('Main Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('renders customer view by default', () => {
    // No token in localStorage
    jwt.decode.mockImplementation(() => null);
    
    render(<Main />);
    expect(screen.getByTestId('customer-component')).toBeInTheDocument();
  });

  it('renders seller view for seller role', () => {
    // Set up seller token
    localStorage.setItem('user_login_token', 'fake-seller-token');
    jwt.decode.mockImplementation(() => ({ role: 'seller' }));
    
    render(<Main />);
    expect(screen.getByTestId('seller-component')).toBeInTheDocument();
  });

  it('renders admin view for admin role', () => {
    // Set up admin token
    localStorage.setItem('user_login_token', 'fake-admin-token');
    jwt.decode.mockImplementation(() => ({ role: 'admin' }));
    
    render(<Main />);
    expect(screen.getByTestId('admin-component')).toBeInTheDocument();
  });

  it('renders customer view for customer role', () => {
    // Set up customer token
    localStorage.setItem('user_login_token', 'fake-customer-token');
    jwt.decode.mockImplementation(() => ({ role: 'customer' }));
    
    render(<Main />);
    expect(screen.getByTestId('customer-component')).toBeInTheDocument();
  });
});
