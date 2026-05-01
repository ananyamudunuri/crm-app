/**
 * Affiliation Manager Component
 * Manages child affiliates within Customer Detail Page
 */

import React, { useState, useEffect } from 'react';
import { useToast } from '../Common/UI/Toast';
import Button from '../Common/UI/Button';
import Modal from '../Common/UI/Modal';
import LoadingSpinner from '../Common/UI/LoadingSpinner';
import AffiliationList from './AffiliationList';
import AddAffiliationForm from './AddAffiliationForm';
import { getCustomerAffiliations, createAffiliation, deleteAffiliation } from '../../services/affiliationService';
import { getAllCustomers } from '../../services/customerService';
import './AffiliationManager.css';

const AffiliationManager = ({ customerId, customerName }) => {
  const { addToast } = useToast();
  const [affiliations, setAffiliations] = useState([]);
  const [availableCustomers, setAvailableCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    loadData();
  }, [customerId]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      const [affiliationsData, allCustomers] = await Promise.all([
        getCustomerAffiliations(customerId),
        getAllCustomers({ page: 1, page_size: 100, status: 'ACTIVE' })
      ]);
      
      setAffiliations(affiliationsData.as_parent || []);
      
      // Filter out customers that are already affiliated or is self
      const affiliatedIds = new Set([
        customerId,
        ...(affiliationsData.as_parent || []).map(a => a.affiliate_customer_id)
      ]);
      
      const available = (allCustomers.items || []).filter(
        c => !affiliatedIds.has(c.customer_id)
      );
      
      setAvailableCustomers(available);
    } catch (error) {
      addToast('Failed to load affiliations', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddAffiliation = async (affiliateId, relationshipType, notes) => {
    setSubmitting(true);
    try {
      await createAffiliation({
        parent_customer_id: customerId,
        affiliate_customer_id: affiliateId,
        relationship_type: relationshipType,
        notes
      });
      
      addToast('Affiliation added successfully', 'success');
      setShowAddModal(false);
      loadData(); // Refresh the list
    } catch (error) {
      addToast(error.message || 'Failed to add affiliation', 'error');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleRemoveAffiliation = async (affiliationId) => {
    try {
      await deleteAffiliation(affiliationId);
      addToast('Affiliation removed successfully', 'success');
      loadData(); // Refresh the list
    } catch (error) {
      addToast('Failed to remove affiliation', 'error');
    }
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="affiliation-manager">
      <div className="affiliation-header">
        <h3>Affiliated Customers</h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowAddModal(true)}
          disabled={availableCustomers.length === 0}
        >
          + Add Affiliation
        </Button>
      </div>
      
      {affiliations.length === 0 ? (
        <div className="affiliation-empty">
          <p>No affiliated customers yet.</p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
            disabled={availableCustomers.length === 0}
          >
            Add your first affiliation
          </Button>
        </div>
      ) : (
        <AffiliationList
          affiliations={affiliations}
          onRemove={handleRemoveAffiliation}
        />
      )}
      
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={`Add Affiliation for ${customerName}`}
        showConfirm={false}
      >
        <AddAffiliationForm
          availableCustomers={availableCustomers}
          onSubmit={handleAddAffiliation}
          onCancel={() => setShowAddModal(false)}
          submitting={submitting}
        />
      </Modal>
    </div>
  );
};

export default AffiliationManager;