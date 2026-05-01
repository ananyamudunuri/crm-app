/**
 * Add Affiliation Form with Customer Search/Select
 */

import React, { useState } from 'react';
import Button from '../Common/UI/Button';
import './AddAffiliationForm.css';

const AddAffiliationForm = ({
  availableCustomers,
  onSubmit,
  onCancel,
  submitting,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [relationshipType, setRelationshipType] = useState('AFFILIATE');
  const [notes, setNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const relationshipTypes = [
    { value: 'AFFILIATE', label: 'Affiliate' },
    { value: 'SUBSIDIARY', label: 'Subsidiary' },
    { value: 'PARTNER', label: 'Partner' },
    { value: 'VENDOR', label: 'Vendor' },
  ];
  
  const filteredCustomers = availableCustomers.filter(customer =>
    customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.industry && customer.industry.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      alert('Please select a customer to affiliate');
      return;
    }
    onSubmit(selectedCustomerId, relationshipType, notes);
  };
  
  const selectedCustomer = availableCustomers.find(c => c.customer_id === selectedCustomerId);
  
  return (
    <form onSubmit={handleSubmit} className="add-affiliation-form">
      <div className="form-group">
        <label className="form-label required">Search Customer</label>
        <input
          type="text"
          placeholder="Type to search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-input"
        />
      </div>
      
      <div className="form-group">
        <label className="form-label required">Select Customer</label>
        <select
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
          className="form-select"
          required
        >
          <option value="">-- Select a customer --</option>
          {filteredCustomers.map(customer => (
            <option key={customer.customer_id} value={customer.customer_id}>
              {customer.customer_name} {customer.industry ? `(${customer.industry})` : ''}
            </option>
          ))}
        </select>
      </div>
      
      {selectedCustomer && (
        <div className="selected-customer-preview">
          <strong>Selected:</strong> {selectedCustomer.customer_name}
          {selectedCustomer.location && <div className="location">{selectedCustomer.location}</div>}
        </div>
      )}
      
      <div className="form-group">
        <label className="form-label">Relationship Type</label>
        <select
          value={relationshipType}
          onChange={(e) => setRelationshipType(e.target.value)}
          className="form-select"
        >
          {relationshipTypes.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-group">
        <label className="form-label">Notes (Optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="form-textarea"
          rows="3"
          placeholder="Add any notes about this affiliation..."
        />
      </div>
      
      <div className="form-actions">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={submitting}>
          Add Affiliation
        </Button>
      </div>
    </form>
  );
};

export default AddAffiliationForm;