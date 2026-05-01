/**
 * Affiliation List Component
 * Displays list of affiliations with remove option
 */

import React, { useState } from 'react';
import ConfirmationDialog from '../Common/UI/ConfirmationDialog';
import './AffiliationList.css';

const AffiliationList = ({ affiliations, onRemove }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedAffiliation, setSelectedAffiliation] = useState(null);
  
  const handleRemoveClick = (affiliation) => {
    setSelectedAffiliation(affiliation);
    setShowConfirm(true);
  };
  
  const handleConfirmRemove = () => {
    if (selectedAffiliation) {
      onRemove(selectedAffiliation.affiliation_id);
    }
    setShowConfirm(false);
    setSelectedAffiliation(null);
  };
  
  const getRelationshipLabel = (type) => {
    const labels = {
      AFFILIATE: 'Affiliate',
      SUBSIDIARY: 'Subsidiary',
      PARTNER: 'Partner',
      VENDOR: 'Vendor',
    };
    return labels[type] || type;
  };
  
  return (
    <>
      <div className="affiliation-list">
        {affiliations.map((affiliation) => (
          <div key={affiliation.affiliation_id} className="affiliation-item">
            <div className="affiliation-info">
              <div className="affiliate-name">
                {affiliation.affiliate_customer_name}
              </div>
              <div className="affiliation-meta">
                <span className="relationship-badge">
                  {getRelationshipLabel(affiliation.relationship_type)}
                </span>
                {affiliation.notes && (
                  <span className="affiliation-notes" title={affiliation.notes}>
                    📝 {affiliation.notes.substring(0, 50)}...
                  </span>
                )}
              </div>
            </div>
            <button
              className="remove-affiliation-btn"
              onClick={() => handleRemoveClick(affiliation)}
              title="Remove affiliation"
            >
              ×
            </button>
          </div>
        ))}
      </div>
      
      <ConfirmationDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmRemove}
        title="Remove Affiliation"
        message={`Are you sure you want to remove the affiliation with ${selectedAffiliation?.affiliate_customer_name}?`}
        confirmText="Remove"
        confirmVariant="danger"
      />
    </>
  );
};

export default AffiliationList;