/**
 * Customer API Service
 */

import api from './api';

export const getAllCustomers = async (params = {}) => {
  const response = await api.get('/customers', { params });
  return response.data;
};

export const getCustomer = async (id) => {
  const response = await api.get(`/customers/${id}`);
  return response.data;
};

export const createCustomer = async (data) => {
  const response = await api.post('/customers', data);
  return response.data;
};

export const updateCustomer = async (id, data) => {
  const response = await api.put(`/customers/${id}`, data);
  return response.data;
};

export const deleteCustomer = async (id) => {
  const response = await api.delete(`/customers/${id}`);
  return response.data;
};

export const updateCustomerStatus = async (id, status) => {
  const response = await api.put(`/customers/${id}`, { status });
  return response.data;
};

export const restoreCustomer = async (id) => {
  const response = await api.post(`/customers/${id}/restore`);
  return response.data;
};