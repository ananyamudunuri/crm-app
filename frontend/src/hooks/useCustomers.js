/**
 * Custom Hook for Customer Management
 * Handles fetching, caching, and mutations
 */

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../components/Common/UI/Toast';
import { 
  getAllCustomers, 
  getCustomer, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer 
} from '../services/customerService';

export const useCustomers = (initialFilters = {}) => {
  const { addToast } = useToast();
  
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState(initialFilters);
  
  // Fetch customers with current filters
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: pagination.page,
        page_size: pagination.pageSize,
        ...filters
      };
      
      const data = await getAllCustomers(params);
      setCustomers(data.items || []);
      setPagination(prev => ({
        ...prev,
        total: data.total,
        totalPages: data.total_pages
      }));
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, filters, addToast]);
  
  // Fetch single customer
  const fetchCustomerById = useCallback(async (id) => {
    try {
      setLoading(true);
      const data = await getCustomer(id);
      return data;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addToast]);
  
  // Create new customer
  const addCustomer = useCallback(async (customerData) => {
    try {
      setLoading(true);
      const newCustomer = await createCustomer(customerData);
      addToast('Customer created successfully', 'success');
      await fetchCustomers(); // Refresh list
      return newCustomer;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addToast, fetchCustomers]);
  
  // Update customer
  const editCustomer = useCallback(async (id, customerData) => {
    try {
      setLoading(true);
      const updated = await updateCustomer(id, customerData);
      addToast('Customer updated successfully', 'success');
      await fetchCustomers(); // Refresh list
      return updated;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addToast, fetchCustomers]);
  
  // Soft delete customer
  const removeCustomer = useCallback(async (id) => {
    try {
      setLoading(true);
      await deleteCustomer(id);
      addToast('Customer deactivated successfully', 'success');
      await fetchCustomers(); // Refresh list
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addToast, fetchCustomers]);
  
  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);
  
  // Change page
  const changePage = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);
  
  // Initial fetch
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);
  
  return {
    customers,
    loading,
    error,
    pagination,
    filters,
    fetchCustomers,
    fetchCustomerById,
    addCustomer,
    editCustomer,
    removeCustomer,
    updateFilters,
    changePage,
    setPageSize: (size) => setPagination(prev => ({ ...prev, pageSize: size, page: 1 }))
  };
};