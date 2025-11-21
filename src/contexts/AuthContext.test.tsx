import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { ReactNode } from 'react';

// Mock API calls
const mockApi = {
  login: vi.fn(),
  logout: vi.fn(),
  getProfile: vi.fn(),
};

vi.mock('@/lib/api', () => ({
  default: {
    login: (...args: any[]) => mockApi.login(...args),
    logout: (...args: any[]) => mockApi.logout(...args),
    getProfile: (...args: any[]) => mockApi.getProfile(...args),
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  describe('initial state', () => {
    it('should initialize with null user and not loading', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('should load user from localStorage if token exists', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'EMPLOYEE',
      };

      localStorageMock.setItem('auth_token', 'mock-token');
      mockApi.getProfile.mockResolvedValue({ data: { user: mockUser } });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'EMPLOYEE',
      };

      mockApi.login.mockResolvedValue({
        data: {
          token: 'mock-token',
          user: mockUser,
        },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
        expect(localStorageMock.getItem('auth_token')).toBe('mock-token');
      });
    });

    it('should throw error on failed login', async () => {
      mockApi.login.mockRejectedValue(new Error('Invalid credentials'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        act(async () => {
          await result.current.login('test@example.com', 'wrongpassword');
        })
      ).rejects.toThrow('Invalid credentials');

      expect(result.current.user).toBeNull();
      expect(localStorageMock.getItem('auth_token')).toBeNull();
    });

    it('should set loading state during login', async () => {
      mockApi.login.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ data: {} }), 100))
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.login('test@example.com', 'password123');
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'EMPLOYEE',
      };

      localStorageMock.setItem('auth_token', 'mock-token');

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Set initial user
      await act(async () => {
        mockApi.login.mockResolvedValue({
          data: {
            token: 'mock-token',
            user: mockUser,
          },
        });
        await result.current.login('test@example.com', 'password123');
      });

      expect(result.current.user).toEqual(mockUser);

      // Logout
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(localStorageMock.getItem('auth_token')).toBeNull();
    });

    it('should clear user data on logout even if API call fails', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'EMPLOYEE',
      };

      localStorageMock.setItem('auth_token', 'mock-token');

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Set initial user
      await act(async () => {
        mockApi.login.mockResolvedValue({
          data: {
            token: 'mock-token',
            user: mockUser,
          },
        });
        await result.current.login('test@example.com', 'password123');
      });

      mockApi.logout.mockRejectedValue(new Error('Logout failed'));

      // Logout should still clear local data
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(localStorageMock.getItem('auth_token')).toBeNull();
    });
  });

  describe('token management', () => {
    it('should store token in localStorage on login', async () => {
      mockApi.login.mockResolvedValue({
        data: {
          token: 'new-mock-token',
          user: {
            id: 'user-123',
            email: 'test@example.com',
          },
        },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(localStorageMock.getItem('auth_token')).toBe('new-mock-token');
    });

    it('should remove token from localStorage on logout', async () => {
      localStorageMock.setItem('auth_token', 'mock-token');

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.logout();
      });

      expect(localStorageMock.getItem('auth_token')).toBeNull();
    });
  });

  describe('user profile', () => {
    it('should fetch user profile on mount if token exists', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'EMPLOYEE',
      };

      localStorageMock.setItem('auth_token', 'existing-token');
      mockApi.getProfile.mockResolvedValue({ data: { user: mockUser } });

      renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(mockApi.getProfile).toHaveBeenCalled();
      });
    });

    it('should not fetch profile if no token exists', () => {
      renderHook(() => useAuth(), { wrapper });

      expect(mockApi.getProfile).not.toHaveBeenCalled();
    });

    it('should handle profile fetch error gracefully', async () => {
      localStorageMock.setItem('auth_token', 'invalid-token');
      mockApi.getProfile.mockRejectedValue(new Error('Unauthorized'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(localStorageMock.getItem('auth_token')).toBeNull();
      });
    });
  });

  describe('role-based access', () => {
    it('should provide user role information', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
      };

      mockApi.login.mockResolvedValue({
        data: {
          token: 'mock-token',
          user: mockUser,
        },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('admin@example.com', 'password123');
      });

      await waitFor(() => {
        expect(result.current.user?.role).toBe('ADMIN');
      });
    });

    it('should handle different user roles', async () => {
      const roles = ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'];

      for (const role of roles) {
        vi.clearAllMocks();

        const mockUser = {
          id: `user-${role}`,
          email: `${role.toLowerCase()}@example.com`,
          firstName: role,
          lastName: 'User',
          role,
        };

        mockApi.login.mockResolvedValue({
          data: {
            token: 'mock-token',
            user: mockUser,
          },
        });

        const { result } = renderHook(() => useAuth(), { wrapper });

        await act(async () => {
          await result.current.login(`${role.toLowerCase()}@example.com`, 'password123');
        });

        await waitFor(() => {
          expect(result.current.user?.role).toBe(role);
        });
      }
    });
  });
});
