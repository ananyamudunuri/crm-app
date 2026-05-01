/**
 * Affiliation API Service
 */

import api from './api';

export const getCustomerAffiliations = async (customerId) => {
  const response = await api.get(`/customers/${customerId}`);
  return {
    as_parent: response.data.affiliations_as_parent || [],
    as_affiliate: response.data.affiliations_as_affiliate || [],
  };
};

export const createAffiliation = async (data) => {
  const response = await api.post('/affiliations', data);
  return response.data;
};

export const updateAffiliation = async (id, data) => {
  const response = await api.put(`/affiliations/${id}`, data);
  return response.data;
};

export const deleteAffiliation = async (id) => {
  const response = await api.delete(`/affiliations/${id}`);
  return response.data;
};

export const getAllAffiliations = async (params = {}) => {
  const response = await api.get('/affiliations', { params });
  return response.data;
};