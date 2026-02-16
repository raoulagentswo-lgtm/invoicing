/**
 * User Profile Page Component
 * 
 * Allows users to view and update their profile information including
 * company details, logo, and contact information
 * 
 * Story: EPIC-5-004/005 - User Profile (View & Update)
 */

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      companyName: '',
      siret: '',
      phone: '',
      logoUrl: ''
    }
  });

  // Fetch user profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        companyName: user.companyName || '',
        siret: user.siret || '',
        phone: user.phone || '',
        logoUrl: user.logoUrl || ''
      });
      setLogoPreview(user.logoUrl);
    }
  }, [user, reset]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
        } else {
          setErrorMessage(result.message || 'Failed to load profile');
        }
        return;
      }

      setUser(result.data.user);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error.message || 'An error occurred while loading profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size must not exceed 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
      setLogoFile(file);
    };
    reader.readAsDataURL(file);
    setErrorMessage(null);
  };

  const onSubmit = async (data) => {
    try {
      setIsSaving(true);
      setErrorMessage(null);
      setFieldErrors({});
      setSuccessMessage(null);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      // Prepare form data with logo file if present
      let logoUrl = data.logoUrl;
      if (logoFile) {
        // In production, this would upload the file and get back a URL
        // For now, we'll use a data URL (not recommended for production)
        logoUrl = logoPreview;
      }

      const updateData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        companyName: data.companyName || null,
        siret: data.siret || null,
        phone: data.phone || null,
        logoUrl: logoUrl || null
      };

      // Remove empty values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '') {
          updateData[key] = null;
        }
      });

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.data?.fields) {
          setFieldErrors(result.data.fields);
          setErrorMessage('Please fix the validation errors');
        } else {
          setErrorMessage(result.message || 'Failed to update profile');
        }
        return;
      }

      // Update local state
      setUser(result.data.user);
      setIsEditing(false);
      setLogoFile(null);
      setSuccessMessage(result.message);

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(result.data.user));

      // Clear message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      setErrorMessage(error.message || 'An error occurred while updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setLogoFile(null);
    reset();
    setFieldErrors({});
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogoFile(null);
    setValue('logoUrl', '');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Unable to load profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-2 text-gray-600">View and update your account information</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 rounded-lg bg-green-50 p-4 border border-green-200">
            <p className="text-sm font-medium text-green-800">
              ✅ {successMessage}
            </p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200">
            <p className="text-sm font-medium text-red-800">
              ❌ {errorMessage}
            </p>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* View Mode Header */}
          {!isEditing && (
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Account Information</h2>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Edit Profile
              </button>
            </div>
          )}

          {/* Edit Mode Header */}
          {isEditing && (
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
              <div className="space-x-3">
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-4 py-2 text-gray-700 bg-gray-200 font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition duration-200"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Logo Section */}
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Logo Preview */}
              <div className="flex flex-col items-center sm:items-start">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Company Logo
                </label>
                <div className="relative">
                  <div className="w-32 h-32 rounded-lg border-2 border-gray-300 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Company logo preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <p className="text-gray-500 text-sm">No logo</p>
                      </div>
                    )}
                  </div>
                  {isEditing && logoPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-700"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Logo Upload & Info */}
              <div className="flex-1">
                {isEditing && (
                  <>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-gray-200 text-gray-900 font-medium rounded-lg hover:bg-gray-300 transition duration-200 text-sm"
                    >
                      Upload New Logo
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <p className="mt-3 text-xs text-gray-500">
                      PNG, JPG, GIF or WebP. Max 5MB.
                    </p>
                  </>
                )}
                {!isEditing && (
                  <p className="text-sm text-gray-600">
                    {logoPreview ? 'Logo uploaded' : 'No logo uploaded yet'}
                  </p>
                )}
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Personal Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                {!isEditing ? (
                  <p className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {user.firstName}
                  </p>
                ) : (
                  <>
                    <input
                      type="text"
                      id="firstName"
                      placeholder="John"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        errors.firstName || fieldErrors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      {...register('firstName', {
                        required: 'First name is required',
                        minLength: { value: 2, message: 'Must be at least 2 characters' },
                        maxLength: { value: 100, message: 'Must not exceed 100 characters' }
                      })}
                      disabled={isSaving}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-500">{errors.firstName.message}</p>
                    )}
                    {fieldErrors.firstName && (
                      <p className="mt-1 text-sm text-red-500">{fieldErrors.firstName[0]}</p>
                    )}
                  </>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                {!isEditing ? (
                  <p className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {user.lastName}
                  </p>
                ) : (
                  <>
                    <input
                      type="text"
                      id="lastName"
                      placeholder="Doe"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        errors.lastName || fieldErrors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      {...register('lastName', {
                        required: 'Last name is required',
                        minLength: { value: 2, message: 'Must be at least 2 characters' },
                        maxLength: { value: 100, message: 'Must not exceed 100 characters' }
                      })}
                      disabled={isSaving}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-500">{errors.lastName.message}</p>
                    )}
                    {fieldErrors.lastName && (
                      <p className="mt-1 text-sm text-red-500">{fieldErrors.lastName[0]}</p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              {!isEditing ? (
                <p className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {user.email}
                  {user.emailVerified && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      ✓ Verified
                    </span>
                  )}
                </p>
              ) : (
                <>
                  <input
                    type="email"
                    id="email"
                    placeholder="john@example.com"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                      errors.email || fieldErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Invalid email format'
                      }
                    })}
                    disabled={isSaving}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                  )}
                  {fieldErrors.email && (
                    <p className="mt-1 text-sm text-red-500">{fieldErrors.email[0]}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Changing your email will require verification.
                  </p>
                </>
              )}
            </div>

            <hr className="border-gray-200" />

            {/* Company Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Company Name */}
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                {!isEditing ? (
                  <p className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {user.companyName || '—'}
                  </p>
                ) : (
                  <>
                    <input
                      type="text"
                      id="companyName"
                      placeholder="Your Company Name"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        fieldErrors.companyName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      {...register('companyName', {
                        minLength: { value: 2, message: 'Must be at least 2 characters' },
                        maxLength: { value: 255, message: 'Must not exceed 255 characters' }
                      })}
                      disabled={isSaving}
                    />
                    {fieldErrors.companyName && (
                      <p className="mt-1 text-sm text-red-500">{fieldErrors.companyName[0]}</p>
                    )}
                  </>
                )}
              </div>

              {/* SIRET */}
              <div>
                <label htmlFor="siret" className="block text-sm font-medium text-gray-700 mb-2">
                  SIRET (French Business ID)
                </label>
                {!isEditing ? (
                  <p className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                    {user.siret || '—'}
                  </p>
                ) : (
                  <>
                    <input
                      type="text"
                      id="siret"
                      placeholder="14 digit SIRET number"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                        fieldErrors.siret ? 'border-red-500' : 'border-gray-300'
                      }`}
                      {...register('siret')}
                      disabled={isSaving}
                    />
                    {fieldErrors.siret && (
                      <p className="mt-1 text-sm text-red-500">{fieldErrors.siret[0]}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Format: 14 digits (e.g., 12345678901234)
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              {!isEditing ? (
                <p className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {user.phone || '—'}
                </p>
              ) : (
                <>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="+33 1 23 45 67 89"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                      fieldErrors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    {...register('phone')}
                    disabled={isSaving}
                  />
                  {fieldErrors.phone && (
                    <p className="mt-1 text-sm text-red-500">{fieldErrors.phone[0]}</p>
                  )}
                </>
              )}
            </div>

            {/* Info Box */}
            {!isEditing && (
              <div className="rounded-lg bg-blue-50 p-4 border border-blue-200">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">💡 Tip:</span> Keep your profile up to date so clients see your professional information.
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-white rounded-lg shadow border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Account Details</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Status:</strong> {user.status}</p>
            <p><strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
            <p><strong>Last Updated:</strong> {new Date(user.updatedAt).toLocaleDateString()}</p>
            {user.lastLoginAt && (
              <p><strong>Last Login:</strong> {new Date(user.lastLoginAt).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
