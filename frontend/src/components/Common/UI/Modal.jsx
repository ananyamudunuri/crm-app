/**
 * Modal Component for Confirmations and Forms
 */

import React, { useEffect } from 'react';
import Button from './Button';

const Modal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  showConfirm = true,
  showCancel = true,
  confirmVariant = 'primary',
  isLoading = false,
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };
  
  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        {title && (
          <div className="modal-header">
            <h3>{title}</h3>
          </div>
        )}
        <div className="modal-body">{children}</div>
        {(showConfirm || showCancel) && (
          <div className="modal-footer">
            {showCancel && (
              <Button variant="secondary" onClick={onClose}>
                {cancelText}
              </Button>
            )}
            {showConfirm && (
              <Button variant={confirmVariant} onClick={onConfirm} loading={isLoading}>
                {confirmText}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;