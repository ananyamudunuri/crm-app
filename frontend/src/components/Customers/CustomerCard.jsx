/**
 * Customer Card Component (Grid View)
 * Displays customer information in a card format for grid layouts
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CustomerCard.css';

const CustomerCard = ({ customer }) => {
  const navigate = useNavigate();
  
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return '#10b981';
      case 'INACTIVE': return '#ef4444';
      case 'SUSPENDED': return '#f59e0b';
      default: return '#6b7280';
    }
  };
  
  const handleClick = () => {
    navigate(`/customers/${customer.customer_id}`);
  };
  
  return (
    <div className="customer-card" onClick={handleClick}>
      <div className="card-header">
        <div className="customer-avatar">
          {customer.logo_url ? (
            <img src={customer.logo_url} alt={customer.customer_name} />
          ) : (
            <div className="avatar-initials">{getInitials(customer.customer_name)}</div>
          )}
        </div>
        <div className="customer-status">
          <span 
            className="status-dot" 
            style={{ backgroundColor: getStatusColor(customer.status) }}
          />
          <span className="status-text">{customer.status}</span>
        </div>
      </div>
      
      <div className="card-body">
        <h3 className="customer-name">{customer.customer_name}</h3>
        {customer.industry && (
          <p className="customer-industry">{customer.industry}</p>
        )}
        {customer.location && (
          <div className="customer-location">
            <span className="location-icon">📍</span>
            <span>{customer.location}</span>
          </div>
        )}
      </div>
      
      <div className="card-footer">
        {customer.email && (
          <div className="contact-info">
            <span className="email-icon">📧</span>
            <span className="email-text">{customer.email}</span>
          </div>
        )}
        {customer.phone && (
          <div className="contact-info">
            <span className="phone-icon">📞</span>
            <span>{customer.phone}</span>
          </div>
        )}
      </div>
      
      <div className="card-stats">
        {customer.no_of_employees && (
          <div className="stat">
            <span className="stat-value">{customer.no_of_employees.toLocaleString()}</span>
            <span className="stat-label">Employees</span>
          </div>
        )}
        {customer.established_year && (
          <div className="stat">
            <span className="stat-value">{customer.established_year}</span>
            <span className="stat-label">Established</span>
          </div>
        )}
        <div className="stat">
          <span className="stat-value">{customer.affiliate_count || 0}</span>
          <span className="stat-label">Affiliates</span>
        </div>
      </div>
    </div>
  );
};

export default CustomerCard;