/**
 * Custom Hook for Affiliation Management
 */

import { useState, useCallback } from 'react';
import { useToast } from '../components/Common/UI/Toast';
import { 
  getCustomerAffiliations, 
  createAffiliation, 
  updateAffiliation, 
  deleteAffiliation 
} from '../services/affiliationService';

export const useAffiliations = (customerId) => {
  const { addToast } = useToast();
  
  const [affiliations, setAffiliations] = useState({
    as_parent: [],
    as_affiliate: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch all affiliations for a customer
  const fetchAffiliations = useCallback(async () => {
    if (!customerId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getCustomerAffiliations(customerId);
      setAffiliations(data);
    } catch (err) {
      setError(err.message);
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [customerId, addToast]);
  
  // Add new affiliation
  const addAffiliation = useCallback(async (affiliationData) => {
    try {
      setLoading(true);
      const newAffiliation = await createAffiliation(affiliationData);
      addToast('Affiliation added successfully', 'success');
      await fetchAffiliations(); // Refresh list
      return newAffiliation;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addToast, fetchAffiliations]);
  
  // Update affiliation
  const editAffiliation = useCallback(async (affiliationId, updateData) => {
    try {
      setLoading(true);
      const updated = await updateAffiliation(affiliationId, updateData);
      addToast('Affiliation updated successfully', 'success');
      await fetchAffiliations(); // Refresh list
      return updated;
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addToast, fetchAffiliations]);
  
  // Remove affiliation
  const removeAffiliation = useCallback(async (affiliationId) => {
    try {
      setLoading(true);
      await deleteAffiliation(affiliationId);
      addToast('Affiliation removed successfully', 'success');
      await fetchAffiliations(); // Refresh list
    } catch (err) {
      addToast(err.message, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addToast, fetchAffiliations]);
  
  // Initial fetch
  useState(() => {
    if (customerId) {
      fetchAffiliations();
    }
  }, [customerId, fetchAffiliations]);
  
  return {
    affiliations,
    loading,
    error,
    fetchAffiliations,
    addAffiliation,
    editAffiliation,
    removeAffiliation,
    hasAffiliations: affiliations.as_parent.length > 0 || affiliations.as_affiliate.length > 0
  };
};