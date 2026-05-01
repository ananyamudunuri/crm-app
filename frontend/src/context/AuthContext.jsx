/**
 * Authentication Context for User Management
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const AuthContext = createContext();

// Mock user data - replace with actual API calls
const MOCK_USERS = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'Admin User' },
  { id: 2, username: 'user', password: 'user123', role: 'user', name: 'Regular User' }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useLocalStorage('auth_user', null);
  const [token, setToken] = useLocalStorage('auth_token', null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const foundUser = MOCK_USERS.find(
        u => u.username === username && u.password === password
      );
      
      if (!foundUser) {
        throw new Error('Invalid credentials');
      }
      
      const { password: _, ...userWithoutPassword } = foundUser;
      const mockToken = `mock-jwt-token-${Date.now()}`;
      
      setUser(userWithoutPassword);
      setToken(mockToken);
      
      return userWithoutPassword;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setUser, setToken]);
  
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setError(null);
  }, [setUser, setToken]);
  
  const updateUser = useCallback(async (userData) => {
    setLoading(true);
    
    try {
      // Simulate API call to update user
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, setUser]);
  
  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    
    // Define role-based permissions
    const permissions = {
      admin: ['view_customers', 'edit_customers', 'delete_customers', 'view_affiliations', 'edit_affiliations'],
      user: ['view_customers', 'view_affiliations']
    };
    
    const userPermissions = permissions[user.role] || [];
    return userPermissions.includes(permission);
  }, [user]);
  
  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    hasPermission,
    isAdmin: user?.role === 'admin'
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Protected Route Component
export const ProtectedRoute = ({ children, requiredPermission }) => {
  const { isAuthenticated, hasPermission } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};