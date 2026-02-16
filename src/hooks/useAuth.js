/**
 * useAuth Hook
 * 
 * Manages user authentication state and provides login/logout/refresh functionality
 * Story: EPIC-5-002 - User Login
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for authentication
 * 
 * Provides:
 * - user: Current authenticated user object
 * - isAuthenticated: Boolean flag
 * - isLoading: Loading state during auth operations
 * - error: Error message if any
 * - login: Function to login user
 * - logout: Function to logout user
 * - refreshToken: Function to refresh JWT token
 * - getAuthHeader: Function to get Authorization header
 * 
 * @returns {Object} Auth context object
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const refreshTokenTimeoutRef = useRef(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setAccessToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Failed to parse stored user:', err);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
    }

    setIsLoading(false);
  }, []);

  // Decode JWT token to get expiration
  const getTokenExpiration = useCallback((token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      return payload.exp ? payload.exp * 1000 : null;
    } catch (err) {
      console.error('Failed to decode token:', err);
      return null;
    }
  }, []);

  // Setup token refresh before expiration
  const setupTokenRefresh = useCallback(
    (token) => {
      if (refreshTokenTimeoutRef.current) {
        clearTimeout(refreshTokenTimeoutRef.current);
      }

      const expiryTime = getTokenExpiration(token);
      if (expiryTime) {
        // Refresh token 5 minutes before expiration (30 min token - 25 min wait)
        const timeUntilRefresh = expiryTime - Date.now() - 5 * 60 * 1000;

        if (timeUntilRefresh > 0) {
          refreshTokenTimeoutRef.current = setTimeout(() => {
            refreshToken();
          }, timeUntilRefresh);
        }
      }
    },
    [getTokenExpiration]
  );

  // Login function
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }

      const { accessToken: token, user: userData } = result.data;

      // Store in state
      setAccessToken(token);
      setUser(userData);

      // Store in localStorage
      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Setup token refresh
      setupTokenRefresh(token);

      return { success: true, user: userData };
    } catch (err) {
      const errorMsg = err.message || 'An error occurred during login';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [setupTokenRefresh]);

  // Logout function
  const logout = useCallback(async () => {
    // Clear token refresh timeout
    if (refreshTokenTimeoutRef.current) {
      clearTimeout(refreshTokenTimeoutRef.current);
    }

    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('rememberMeToken');
    localStorage.removeItem('rememberMeExpiry');

    // Call logout endpoint (optional)
    try {
      if (accessToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
      }
    } catch (err) {
      console.error('Logout API call failed:', err);
    }

    // Clear state
    setUser(null);
    setAccessToken(null);
    setError(null);
  }, [accessToken]);

  // Refresh token function
  const refreshToken = useCallback(async () => {
    if (!accessToken) {
      setError('No token to refresh');
      return { success: false };
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // If refresh fails, logout user
        await logout();
        throw new Error('Token refresh failed');
      }

      const result = await response.json();
      const newToken = result.data.accessToken;

      // Update token
      setAccessToken(newToken);
      localStorage.setItem('accessToken', newToken);

      // Setup refresh for new token
      setupTokenRefresh(newToken);

      return { success: true, accessToken: newToken };
    } catch (err) {
      const errorMsg = err.message || 'Failed to refresh token';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [accessToken, logout, setupTokenRefresh]);

  // Get Authorization header
  const getAuthHeader = useCallback(() => {
    if (!accessToken) {
      return {};
    }
    return {
      'Authorization': `Bearer ${accessToken}`
    };
  }, [accessToken]);

  // Check if token is expired
  const isTokenExpired = useCallback(() => {
    if (!accessToken) return true;

    const expiryTime = getTokenExpiration(accessToken);
    if (!expiryTime) return true;

    return expiryTime <= Date.now();
  }, [accessToken, getTokenExpiration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTokenTimeoutRef.current) {
        clearTimeout(refreshTokenTimeoutRef.current);
      }
    };
  }, []);

  return {
    user,
    accessToken,
    isAuthenticated: !!user && !!accessToken && !isTokenExpired(),
    isLoading,
    error,
    login,
    logout,
    refreshToken,
    getAuthHeader,
    isTokenExpired
  };
}

/**
 * Context-based Auth Provider (optional, for App-wide usage)
 * 
 * Usage:
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * 
 * Then use:
 * const { user, login, logout } = useAuthContext();
 */

import React, { createContext, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
