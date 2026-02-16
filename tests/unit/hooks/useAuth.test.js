/**
 * useAuth Hook Unit Tests
 * 
 * Tests for authentication hook with token management and login/logout
 * Story: EPIC-5-002 - User Login
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../../../src/hooks/useAuth.js';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};

  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock fetch
global.fetch = jest.fn();

describe('useAuth Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with no user when localStorage is empty', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.accessToken).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should load user from localStorage if token exists', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockToken = 'test-token';

      localStorage.setItem('accessToken', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.accessToken).toBe(mockToken);
    });
  });

  describe('Login', () => {
    it('should login user with valid credentials', async () => {
      const mockUser = { id: '123', email: 'test@example.com', firstName: 'John' };
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJleHAiOjk5OTk5OTk5OTl9.test';

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 'LOGIN_SUCCESS',
          data: {
            user: mockUser,
            accessToken: mockToken,
            expiresIn: '30d'
          }
        })
      });

      const { result } = renderHook(() => useAuth());

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'password');
      });

      expect(loginResult.success).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.accessToken).toBe(mockToken);
      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorage.getItem('accessToken')).toBe(mockToken);
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
    });

    it('should handle login failure', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        })
      });

      const { result } = renderHook(() => useAuth());

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'wrongpassword');
      });

      expect(loginResult.success).toBe(false);
      expect(loginResult.error).toBe('Invalid email or password');
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle network errors during login', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAuth());

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'password');
      });

      expect(loginResult.success).toBe(false);
      expect(loginResult.error).toContain('error');
      expect(result.current.user).toBeNull();
    });
  });

  describe('Logout', () => {
    it('should logout user and clear localStorage', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockToken = 'test-token';

      localStorage.setItem('accessToken', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ code: 'LOGOUT_SUCCESS' })
      });

      const { result } = renderHook(() => useAuth());

      // Wait for initialization
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Perform logout
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.accessToken).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('should clear remember me tokens on logout', async () => {
      const mockToken = 'test-token';

      localStorage.setItem('accessToken', mockToken);
      localStorage.setItem('rememberMeToken', 'remember-token');
      localStorage.setItem('rememberMeExpiry', '2026-02-16T00:00:00.000Z');

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ code: 'LOGOUT_SUCCESS' })
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(localStorage.getItem('rememberMeToken')).toBeNull();
      expect(localStorage.getItem('rememberMeExpiry')).toBeNull();
    });
  });

  describe('Token Refresh', () => {
    it('should refresh expired token', async () => {
      const oldToken = 'old-token';
      const newToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJleHAiOjk5OTk5OTk5OTl9.test';

      localStorage.setItem('accessToken', oldToken);

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 'TOKEN_REFRESHED',
          data: {
            accessToken: newToken,
            expiresIn: '30d'
          }
        })
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let refreshResult;
      await act(async () => {
        refreshResult = await result.current.refreshToken();
      });

      expect(refreshResult.success).toBe(true);
      expect(result.current.accessToken).toBe(newToken);
      expect(localStorage.getItem('accessToken')).toBe(newToken);
    });

    it('should logout if token refresh fails', async () => {
      const oldToken = 'old-token';

      localStorage.setItem('accessToken', oldToken);

      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          code: 'TOKEN_REFRESH_FAILED',
          message: 'Token invalid'
        })
      });

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let refreshResult;
      await act(async () => {
        refreshResult = await result.current.refreshToken();
      });

      expect(refreshResult.success).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Auth Header', () => {
    it('should return auth header with token', async () => {
      const mockToken = 'test-token';
      localStorage.setItem('accessToken', mockToken);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const header = result.current.getAuthHeader();

      expect(header).toEqual({
        'Authorization': `Bearer ${mockToken}`
      });
    });

    it('should return empty header when no token', async () => {
      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const header = result.current.getAuthHeader();

      expect(header).toEqual({});
    });
  });

  describe('Token Expiration Check', () => {
    it('should detect expired token', async () => {
      // Token with exp in the past
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJleHAiOjE2MDAwMDAwMDB9.test';

      localStorage.setItem('accessToken', expiredToken);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isTokenExpired()).toBe(true);
    });

    it('should detect valid token', async () => {
      // Token with exp far in the future
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJleHAiOjk5OTk5OTk5OTl9.test';

      localStorage.setItem('accessToken', validToken);

      const { result } = renderHook(() => useAuth());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isTokenExpired()).toBe(false);
    });
  });
});
