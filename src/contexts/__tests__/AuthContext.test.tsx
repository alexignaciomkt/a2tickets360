import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../AuthContext';
import { api } from '@/services/api';

// Mock do localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock do useToast
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock da API
vi.mock('@/services/api', () => ({
  api: {
    post: vi.fn(),
  },
}));

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const TestComponent = () => {
    const { user, login, logout, isAuthenticated, token } = useAuth();
    return (
      <div>
        <span data-testid="isAuthenticated">{isAuthenticated ? 'true' : 'false'}</span>
        <span data-testid="userEmail">{user?.email}</span>
        <span data-testid="token">{token}</span>
        <button onClick={() => login('test@example.com', 'password123')}>Login</button>
        <button onClick={logout}>Logout</button>
      </div>
    );
  };

  it('should provide initial unauthenticated state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('userEmail')).toBeEmptyDOMElement();
    expect(screen.getByTestId('token')).toBeEmptyDOMElement();
  });

  it('should log in a user and store data in localStorage', async () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com', role: 'customer', profileComplete: true, photoUrl: '' };
    const mockToken = 'mock_token_123';

    (api.post as vi.Mock).mockResolvedValueOnce({
      user: mockUser,
      token: mockToken,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText('Login').click();
    });

    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('userEmail')).toHaveTextContent('test@example.com');
    expect(screen.getByTestId('token')).toHaveTextContent(mockToken);
    expect(localStorage.getItem('A2Tickets_user')).toBeDefined();
    expect(localStorage.getItem('A2Tickets_token')).toBe(mockToken);
  });

  it('should log out a user and clear data from localStorage', async () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com', role: 'customer', profileComplete: true, photoUrl: '' };
    const mockToken = 'mock_token_123';

    localStorage.setItem('A2Tickets_user', JSON.stringify(mockUser));
    localStorage.setItem('A2Tickets_token', mockToken);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');

    await act(async () => {
      screen.getByText('Logout').click();
    });

    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('userEmail')).toBeEmptyDOMElement();
    expect(screen.getByTestId('token')).toBeEmptyDOMElement();
    expect(localStorage.getItem('A2Tickets_user')).toBeNull();
    expect(localStorage.getItem('A2Tickets_token')).toBeNull();
  });

  it('should load user from localStorage on initial render if available', () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@example.com', role: 'customer', profileComplete: true, photoUrl: '' };
    const mockToken = 'mock_token_123';

    localStorage.setItem('A2Tickets_user', JSON.stringify(mockUser));
    localStorage.setItem('A2Tickets_token', mockToken);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('userEmail')).toHaveTextContent('test@example.com');
    expect(screen.getByTestId('token')).toHaveTextContent(mockToken);
  });
});
