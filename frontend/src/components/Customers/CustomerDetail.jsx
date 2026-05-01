/**
 * Customer Detail Page
 * Integrates all components: Customer Info, Affiliations, Notes
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../Common/UI/Toast';
import Button from '../Common/UI/Button';
import LoadingSpinner from '../Common/UI/LoadingSpinner';
import AffiliationManager from '../Affiliations/AffiliationManager';
import NotesTimeline from '../Notes/NotesTimeline';
import { getCustomer } from '../../services/customerService';
import { formatDate, formatPhone } from '../../utils/formatters';
import './CustomerDetail.css';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadCustomer();
  }, [id]);
  
  const loadCustomer = async () => {
    try {
      setLoading(true);
      const data = await getCustomer(id);
      setCustomer(data);
    } catch (error) {
      addToast('Failed to load customer details', 'error');
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!customer) {
    return <div>Customer not found</div>;
  }
  
  return (
    <div className="customer-detail-container">
      {/* Header */}
      <div className="detail-header">
        <div className="header-left">
          <button onClick={() => navigate('/customers')} className="back-btn">
            ← Back to Customers
          </button>
          <h1>{customer.customer_name}</h1>
          <span className={`status-badge status-${customer.status.toLowerCase()}`}>
            {customer.status}
          </span>
        </div>
        <div className="header-right">
          <Button variant="secondary" onClick={() => navigate(`/customers/${id}/edit`)}>
            Edit Customer
          </Button>
        </div>
      </div>
      
      {/* Info Cards Grid */}
      <div className="detail-grid">
        {/* Basic Info Card */}
        <div className="info-card">
          <h3>Contact Information</h3>
          <div className="info-row">
            <span className="info-label">Email:</span>
            <span className="info-value">{customer.email || '—'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Phone:</span>
            <span className="info-value">{formatPhone(customer.phone) || '—'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Location:</span>
            <span className="info-value">{customer.location || '—'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Website:</span>
            <span className="info-value">
              {customer.website ? (
                <a href={customer.website} target="_blank" rel="noopener noreferrer">
                  {customer.website}
                </a>
              ) : '—'}
            </span>
          </div>
        </div>
        
        {/* Business Info Card */}
        <div className="info-card">
          <h3>Business Information</h3>
          <div className="info-row">
            <span className="info-label">Industry:</span>
            <span className="info-value">{customer.industry || '—'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Employees:</span>
            <span className="info-value">
              {customer.no_of_employees ? customer.no_of_employees.toLocaleString() : '—'}
            </span>
          </div>
          <div className="info-row">
            <span className="info-label">Established:</span>
            <span className="info-value">{customer.established_year || '—'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Customer Since:</span>
            <span className="info-value">{formatDate(customer.created_at)}</span>
          </div>
        </div>
      </div>
      
      {/* Affiliations Section */}
      <div className="detail-section">
        <AffiliationManager customerId={id} customerName={customer.customer_name} />
      </div>
      
      {/* Notes Section */}
      <div className="detail-section">
        <NotesTimeline customerId={id} />
      </div>
    </div>
  );
};

export default CustomerDetail;