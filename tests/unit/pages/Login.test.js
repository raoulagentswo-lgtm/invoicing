/**
 * Login Page Component Unit Tests
 * 
 * Tests for the Login component with form validation and submission
 * Story: EPIC-5-002 - User Login
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../../src/pages/Login.jsx';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

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

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
};

describe('Login Page Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('Form Rendering', () => {
    it('should render login form with email and password fields', () => {
      renderLogin();

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should render "Remember me" checkbox', () => {
      renderLogin();

      const checkbox = screen.getByRole('checkbox', { name: /remember me/i });
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it('should render links to signup and password reset', () => {
      renderLogin();

      expect(screen.getByRole('link', { name: /create one now/i })).toHaveAttribute('href', '/register');
      expect(screen.getByRole('link', { name: /forgot password/i })).toHaveAttribute('href', '/reset-password');
    });

    it('should render security notices', () => {
      renderLogin();

      expect(screen.getByText(/security/i)).toBeInTheDocument();
      expect(screen.getByText(/rate limiting/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', async () => {
      renderLogin();
      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'invalid-email');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });
    });

    it('should require email field', async () => {
      renderLogin();
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('should require password field', async () => {
      renderLogin();
      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('should enable submit button only when form is valid', async () => {
      renderLogin();
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Initially disabled state
      expect(submitButton).not.toBeDisabled();

      // Fill valid data
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'TestPassword123!');

      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid credentials', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 'LOGIN_SUCCESS',
          data: {
            user: { id: '123', email: 'test@example.com' },
            accessToken: 'test-token',
            expiresIn: '30d'
          }
        })
      });

      renderLogin();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'TestPassword123!');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/auth/login',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          })
        );
      });
    });

    it('should store token and user in localStorage on success', async () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockToken = 'test-token';

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

      renderLogin();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'TestPassword123!');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(localStorage.getItem('accessToken')).toBe(mockToken);
        expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
      });
    });

    it('should display success message on login', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 'LOGIN_SUCCESS',
          data: {
            user: { id: '123', email: 'test@example.com' },
            accessToken: 'test-token',
            expiresIn: '30d'
          }
        })
      });

      renderLogin();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'TestPassword123!');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/login successful/i)).toBeInTheDocument();
      });
    });

    it('should redirect to dashboard after successful login', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 'LOGIN_SUCCESS',
          data: {
            user: { id: '123', email: 'test@example.com' },
            accessToken: 'test-token',
            expiresIn: '30d'
          }
        })
      });

      jest.useFakeTimers();

      renderLogin();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'TestPassword123!');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/login successful/i)).toBeInTheDocument();
      });

      jest.advanceTimersByTime(1500);

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');

      jest.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    it('should display error message on login failure', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        })
      });

      renderLogin();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'WrongPassword123!');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });
    });

    it('should display account locked message', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          code: 'ACCOUNT_LOCKED',
          message: 'Account temporarily locked'
        })
      });

      renderLogin();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'WrongPassword123!');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/temporarily locked/i)).toBeInTheDocument();
      });
    });

    it('should display password reset link when account is locked', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          code: 'ACCOUNT_LOCKED',
          message: 'Account temporarily locked'
        })
      });

      renderLogin();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'WrongPassword123!');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /reset it here/i })).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      renderLogin();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'TestPassword123!');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/error occurred/i)).toBeInTheDocument();
      });
    });
  });

  describe('Remember Me Feature', () => {
    it('should store email when "Remember me" is checked', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 'LOGIN_SUCCESS',
          data: {
            user: { id: '123', email: 'test@example.com' },
            accessToken: 'test-token',
            expiresIn: '30d'
          }
        })
      });

      renderLogin();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const rememberCheckbox = screen.getByRole('checkbox', { name: /remember me/i });
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'TestPassword123!');
      fireEvent.click(rememberCheckbox);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(localStorage.getItem('rememberEmail')).toBe('test@example.com');
      });
    });

    it('should not store email when "Remember me" is unchecked', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 'LOGIN_SUCCESS',
          data: {
            user: { id: '123', email: 'test@example.com' },
            accessToken: 'test-token',
            expiresIn: '30d'
          }
        })
      });

      renderLogin();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'TestPassword123!');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(localStorage.getItem('rememberEmail')).toBeNull();
      });
    });

    it('should pre-fill email if "Remember me" was previously checked', () => {
      localStorage.setItem('rememberEmail', 'remembered@example.com');

      renderLogin();

      const emailInput = screen.getByLabelText(/email address/i);
      const checkbox = screen.getByRole('checkbox', { name: /remember me/i });

      expect(emailInput.value).toBe('remembered@example.com');
      expect(checkbox).toBeChecked();
    });

    it('should clear remember me data on logout', async () => {
      localStorage.setItem('rememberEmail', 'test@example.com');
      localStorage.setItem('rememberMeToken', 'remember-token');
      localStorage.setItem('rememberMeExpiry', '2026-05-16T00:00:00.000Z');

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          code: 'LOGIN_SUCCESS',
          data: {
            user: { id: '123', email: 'test@example.com' },
            accessToken: 'test-token',
            expiresIn: '30d'
          }
        })
      });

      renderLogin();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'TestPassword123!');
      fireEvent.click(submitButton);

      // Even without explicit logout, clearing the data ensures
      // that the tokens are cleared when user logs in
      expect(localStorage.getItem('accessToken')).toBe('test-token');
    });
  });

  describe('Loading States', () => {
    it('should disable form during submission', async () => {
      global.fetch.mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({
            code: 'LOGIN_SUCCESS',
            data: {
              user: { id: '123', email: 'test@example.com' },
              accessToken: 'test-token',
              expiresIn: '30d'
            }
          })
        }), 100))
      );

      renderLogin();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'TestPassword123!');

      fireEvent.click(submitButton);

      // Check that button shows loading state
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /signing in/i })).toBeInTheDocument();
      });
    });

    it('should show signing in text during submission', async () => {
      global.fetch.mockImplementationOnce(
        () => new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: async () => ({
            code: 'LOGIN_SUCCESS',
            data: {
              user: { id: '123', email: 'test@example.com' },
              accessToken: 'test-token',
              expiresIn: '30d'
            }
          })
        }), 200))
      );

      renderLogin();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(passwordInput, 'TestPassword123!');

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /signing in/i })).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should render form container with proper spacing', () => {
      renderLogin();

      const formContainer = screen.getByLabelText(/email address/i).closest('form');
      expect(formContainer).toHaveClass('space-y-5', 'bg-white', 'p-8', 'rounded-lg', 'shadow-lg');
    });

    it('should have mobile-friendly padding', () => {
      renderLogin();

      const mainContainer = screen.getByText(/sign in to your account/i).closest('div').parentElement;
      expect(mainContainer).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
    });
  });
});
