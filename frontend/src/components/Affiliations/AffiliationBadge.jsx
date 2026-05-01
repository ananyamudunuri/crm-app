/**
 * Affiliation Badge Component
 * Displays relationship type with appropriate styling
 */

import React from 'react';
import './AffiliationBadge.css';

const AffiliationBadge = ({ type, size = 'md', showIcon = true }) => {
  const getTypeConfig = () => {
    switch (type) {
      case 'AFFILIATE':
        return {
          icon: '🤝',
          label: 'Affiliate',
          color: '#3b82f6',
          bgColor: '#dbeafe'
        };
      case 'SUBSIDIARY':
        return {
          icon: '🏢',
          label: 'Subsidiary',
          color: '#10b981',
          bgColor: '#d1fae5'
        };
      case 'PARTNER':
        return {
          icon: '🤝',
          label: 'Partner',
          color: '#8b5cf6',
          bgColor: '#ede9fe'
        };
      case 'VENDOR':
        return {
          icon: '📦',
          label: 'Vendor',
          color: '#f59e0b',
          bgColor: '#fed7aa'
        };
      default:
        return {
          icon: '🔗',
          label: type,
          color: '#6b7280',
          bgColor: '#f3f4f6'
        };
    }
  };
  
  const config = getTypeConfig();
  const sizeClasses = {
    sm: 'badge-sm',
    md: 'badge-md',
    lg: 'badge-lg'
  };
  
  return (
    <span 
      className={`affiliation-badge ${sizeClasses[size]}`}
      style={{ backgroundColor: config.bgColor, color: config.color }}
    >
      {showIcon && <span className="badge-icon">{config.icon}</span>}
      <span className="badge-label">{config.label}</span>
    </span>
  );
};

export default AffiliationBadge;