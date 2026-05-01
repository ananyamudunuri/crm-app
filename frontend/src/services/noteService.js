/**
 * Notes API Service
 */

import api from './api';

export const getCustomerNotes = async (customerId) => {
  const response = await api.get(`/customers/${customerId}`);
  return response.data.notes || [];
};

export const createNote = async (customerId, data) => {
  const response = await api.post(`/customers/${customerId}/notes`, data);
  return response.data;
};

export const updateNote = async (customerId, noteId, data) => {
  const response = await api.put(`/customers/${customerId}/notes/${noteId}`, data);
  return response.data;
};