import React from 'react';
import { render, screen } from '@testing-library/react';
import { Header } from '@/ui/Header';
import { useUserStore } from '@/store/userStore';

// Mock Next.js Link and Image components
jest.mock('next/link', () => {
  return ({ href, children, ...rest }) => {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  };
});

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock the store
jest.mock('@/store/userStore', () => ({
  useUserStore: jest.fn(),
}));

// Mock the components used in Header
jest.mock('@/components/Language', () => ({
  Language: () => <div data-testid="language-component">Language Component</div>,
}));

jest.mock('@/components/Location', () => ({
  Location: () => <div data-testid="location-component">Location Component</div>,
}));

jest.mock('@/components/SearchBar', () => ({
  SearchBar: () => <div data-testid="search-bar-component">SearchBar Component</div>,
}));

describe('Header Component', () => {
  beforeEach(() => {
    // Default mock implementation
    useUserStore.mockImplementation(() => ({
      user: null,
    }));
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('renders login link when not logged in', () => {
    render(<Header />);
    
    expect(screen.getByTestId('language-component')).toBeInTheDocument();
    expect(screen.getByTestId('location-component')).toBeInTheDocument();
    expect(screen.getByTestId('search-bar-component')).toBeInTheDocument();
    
    const loginLink = screen.getByText('Login');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });

  it('renders account link when logged in', () => {
    // Set token in localStorage
    localStorage.setItem('user_login_token', 'fake-token');
    
    render(<Header />);
    
    const accountLink = screen.getByText('Account');
    expect(accountLink).toBeInTheDocument();
    expect(accountLink.closest('a')).toHaveAttribute('href', '/user');
  });
});
