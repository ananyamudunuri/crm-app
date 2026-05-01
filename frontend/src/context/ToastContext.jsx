/**
 * Toast Context for Global Notifications
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  
  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now();
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove toast after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
    
    return id;
  }, []);
  
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);
  
  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);
  
  // Convenience methods
  const showSuccess = useCallback((message, duration) => {
    return addToast(message, 'success', duration);
  }, [addToast]);
  
  const showError = useCallback((message, duration) => {
    return addToast(message, 'error', duration);
  }, [addToast]);
  
  const showInfo = useCallback((message, duration) => {
    return addToast(message, 'info', duration);
  }, [addToast]);
  
  const showWarning = useCallback((message, duration) => {
    return addToast(message, 'warning', duration);
  }, [addToast]);
  
  const value = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showInfo,
    showWarning
  };
  
  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// Toast Container Component
const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;
  
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <div className="toast-content">
            {toast.type === 'success' && <span className="toast-icon">✓</span>}
            {toast.type === 'error' && <span className="toast-icon">✗</span>}
            {toast.type === 'info' && <span className="toast-icon">ℹ</span>}
            {toast.type === 'warning' && <span className="toast-icon">⚠</span>}
            <span className="toast-message">{toast.message}</span>
          </div>
          <button className="toast-close" onClick={() => onRemove(toast.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider');
  }
  return context;
};