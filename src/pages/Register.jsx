/**
 * User Registration Page Component
 * 
 * Allows users to create an account with email, password, and name
 * Story: EPIC-5-001 - User Registration
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm({
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      passwordConfirmation: ''
    }
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          password: data.password,
          passwordConfirmation: data.passwordConfirmation
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setServerError(result.message || 'Registration failed');
        return;
      }

      // Store access token
      localStorage.setItem('accessToken', result.data.accessToken);
      localStorage.setItem('user', JSON.stringify(result.data.user));

      setRegistrationSuccess(true);
      reset();

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      setServerError(error.message || 'An error occurred');
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
          <p className="mt-2 text-gray-600">Create your account</p>
        </div>

        {/* Success Message */}
        {registrationSuccess && (
          <div className="rounded-lg bg-green-50 p-4 border border-green-200">
            <p className="text-sm font-medium text-green-800">
              ✅ Account created successfully! Redirecting to dashboard...
            </p>
          </div>
        )}

        {/* Error Message */}
        {serverError && (
          <div className="rounded-lg bg-red-50 p-4 border border-red-200">
            <p className="text-sm font-medium text-red-800">
              ❌ {serverError}
            </p>
          </div>
        )}

        {/* Registration Form */}
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
              className={`mt-2 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* First Name & Last Name Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                placeholder="John"
                className={`mt-2 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('firstName', {
                  required: 'First name is required',
                  minLength: {
                    value: 2,
                    message: 'First name must be at least 2 characters'
                  },
                  maxLength: {
                    value: 100,
                    message: 'First name must not exceed 100 characters'
                  }
                })}
                disabled={isLoading}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                placeholder="Doe"
                className={`mt-2 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                {...register('lastName', {
                  required: 'Last name is required',
                  minLength: {
                    value: 2,
                    message: 'Last name must be at least 2 characters'
                  },
                  maxLength: {
                    value: 100,
                    message: 'Last name must not exceed 100 characters'
                  }
                })}
                disabled={isLoading}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
              Password *
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              className={`mt-2 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                }
              })}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
            )}
            
            {/* Password Requirements */}
            {password && (
              <div className="mt-3 space-y-2 text-xs text-gray-600">
                <div className={password.length >= 8 ? 'text-green-600' : 'text-gray-400'}>
                  ✓ At least 8 characters
                </div>
                <div className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                  ✓ At least one uppercase letter
                </div>
                <div className={/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                  ✓ At least one number
                </div>
                <div className={/[!@#$%^&*()_+=\-[\]{};':"\\|,.<>/?]/.test(password) ? 'text-green-600' : 'text-gray-400'}>
                  ✓ At least one special character (!@#$%^&* etc.)
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="passwordConfirmation" className="block text-sm font-semibold text-gray-700">
              Confirm Password *
            </label>
            <input
              type="password"
              id="passwordConfirmation"
              placeholder="••••••••"
              className={`mt-2 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.passwordConfirmation ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('passwordConfirmation', {
                required: 'Please confirm your password',
                validate: (value) =>
                  value === password || 'Passwords do not match'
              })}
              disabled={isLoading}
            />
            {errors.passwordConfirmation && (
              <p className="mt-1 text-sm text-red-500">{errors.passwordConfirmation.message}</p>
            )}
          </div>

          {/* Terms & Conditions */}
          <div className="pt-2">
            <p className="text-xs text-gray-600">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-blue-600 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>

          {/* Sign In Link */}
          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </form>

        {/* Info Box */}
        <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">💡 Tip:</span> Use a strong password with uppercase letters, numbers, and special characters for better security.
          </p>
        </div>
      </div>
    </div>
  );
}
