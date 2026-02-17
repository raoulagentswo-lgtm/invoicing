/**
 * User Login Page Component
 * 
 * Allows users to log in with email/password and optional "Remember me" checkbox
 * Story: EPIC-5-002 - User Login
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [errorType, setErrorType] = useState(null); // 'email_not_found' | 'wrong_password' | 'account_locked'
  const [loginSuccess, setLoginSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    defaultValues: {
      email: localStorage.getItem('rememberEmail') || '',
      password: '',
      rememberMe: !!localStorage.getItem('rememberEmail')
    }
  });

  const rememberMe = watch('rememberMe');
  const email = watch('email');

  // Auto-fill email if "Remember me" was checked previously
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberEmail');
    if (savedEmail) {
      // Form already has the default value set
    }
  }, []);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError(null);
    setErrorType(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password
        })
      });

      const result = await response.json();

      if (!response.ok) {
        // Determine error type for better UX
        if (result.code === 'INVALID_CREDENTIALS') {
          setErrorType('wrong_password');
          setServerError('Invalid email or password. Please check and try again.');
        } else if (result.code === 'ACCOUNT_LOCKED') {
          setErrorType('account_locked');
          setServerError('Your account is temporarily locked due to multiple failed login attempts. Please try again later.');
        } else {
          setServerError(result.message || 'Login failed');
        }
        return;
      }

      // Store access token
      localStorage.setItem('accessToken', result.data.accessToken);
      localStorage.setItem('user', JSON.stringify(result.data.user));

      // Handle "Remember me" functionality
      if (data.rememberMe) {
        // Store email for 90 days (session storage)
        localStorage.setItem('rememberEmail', data.email);
        // Store extended session token (optional - for auto-login in future)
        if (result.data.rememberMeToken) {
          localStorage.setItem('rememberMeToken', result.data.rememberMeToken);
          localStorage.setItem('rememberMeExpiry', new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString());
        }
      } else {
        // Clear remember me data if unchecked
        localStorage.removeItem('rememberEmail');
        localStorage.removeItem('rememberMeToken');
        localStorage.removeItem('rememberMeExpiry');
      }

      setLoginSuccess(true);
      reset();

      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      setServerError(error.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Facturation</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        {/* Success Message */}
        {loginSuccess && (
          <div className="rounded-lg bg-green-50 p-4 border border-green-200">
            <p className="text-sm font-medium text-green-800">
              ✅ Login successful! Redirecting to dashboard...
            </p>
          </div>
        )}

        {/* Error Message */}
        {serverError && (
          <div className="rounded-lg bg-red-50 p-4 border border-red-200">
            <p className="text-sm font-medium text-red-800">
              ❌ {serverError}
            </p>
            {errorType === 'account_locked' && (
              <p className="mt-2 text-xs text-red-700">
                The account will be unlocked in 15 minutes. If you forgot your password, you can <Link to="/reset-password" className="font-semibold underline">reset it here</Link>.
              </p>
            )}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-white p-8 rounded-lg shadow-lg">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              className={`mt-2 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email format'
                }
              })}
              disabled={isLoading}
              autoComplete="email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="flex items-center justify-between text-sm font-semibold text-gray-700">
              <span>Password *</span>
              <Link to="/reset-password" className="text-blue-600 hover:underline text-xs font-normal">
                Forgot password?
              </Link>
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              className={`mt-2 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('password', {
                required: 'Password is required'
              })}
              disabled={isLoading}
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              className="h-6 w-6 md:h-4 md:w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              {...register('rememberMe')}
              disabled={isLoading}
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 cursor-pointer">
              Remember me (90 days)
            </label>
          </div>

          {/* Security Notice */}
          <div className="rounded-lg bg-blue-50 p-3 border border-blue-200">
            <p className="text-xs text-blue-800">
              <span className="font-semibold">🔒 Security:</span> Never share your password. We'll never ask you to share it via email.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
              Create one now
            </Link>
          </p>
        </form>

        {/* Rate Limit Info */}
        <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">⏱️ Rate Limiting:</span> Maximum 10 login attempts allowed per 15 minutes. Account will lock after 5 failed attempts for 15 minutes.
          </p>
        </div>

        {/* Version Display */}
        <div className="text-right text-xs text-gray-500 pr-2">
          v1.0.0
        </div>
      </div>
    </div>
  );
}
