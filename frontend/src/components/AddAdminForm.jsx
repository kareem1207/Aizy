"use client";
import { useState } from 'react';
import { useUserStore } from '@/store/userStore';

export const AddAdminForm = ({ onSuccess, onCancel }) => {
  const { createAdmin } = useUserStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    adminId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.name || !formData.email || !formData.password || !formData.adminId) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    try {
      const result = await createAdmin(formData);
      
      if (result.success) {
        setSuccess(result.message || 'Admin created successfully');
        setFormData({
          name: '',
          email: '',
          password: '',
          adminId: ''
        });
        
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }
      } else {
        setError(result.message || 'Failed to create admin');
      }
    } catch (err) {
      console.error('Error creating admin:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-[#3c6ca8]">Add New Admin</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Full name"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="admin@example.com"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Secure password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="adminId" className="block text-sm font-medium text-gray-700 mb-1">
            Your Admin ID (Verification)
          </label>
          <input
            type="text"
            id="adminId"
            name="adminId"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Your unique admin ID"
            value={formData.adminId}
            onChange={handleChange}
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter your admin ID to verify your permission to create a new admin
          </p>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Admin'}
          </button>
        </div>
      </form>
    </div>
  );
};