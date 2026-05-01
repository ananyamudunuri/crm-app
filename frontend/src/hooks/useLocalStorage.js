/**
 * Custom Hook for Local Storage Management
 * Persists state across page reloads
 */

import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
  // Get stored value from localStorage
  const readValue = () => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };
  
  const [storedValue, setStoredValue] = useState(readValue);
  
  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };
  
  // Listen for changes to this localStorage key in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);
  
  return [storedValue, setValue];
};

// Specific hooks for common use cases
export const useUserPreferences = () => {
  return useLocalStorage('userPreferences', {
    theme: 'light',
    sidebarCollapsed: false,
    defaultPageSize: 20,
    notificationsEnabled: true
  });
};

export const useRecentlyViewed = (maxItems = 10) => {
  const [recentlyViewed, setRecentlyViewed] = useLocalStorage('recentlyViewed', []);
  
  const addToRecentlyViewed = (item) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(i => i.id !== item.id);
      const newList = [item, ...filtered];
      return newList.slice(0, maxItems);
    });
  };
  
  return { recentlyViewed, addToRecentlyViewed };
};

export const useFiltersPreset = (presetName) => {
  return useLocalStorage(`filters_${presetName}`, {});
};