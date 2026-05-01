/**
 * Loading Spinner Component
 */

import React from 'react';

const LoadingSpinner = ({ size = 'md', fullPage = false }) => {
  const sizeClass = `spinner-${size}`;
  
  if (fullPage) {
    return (
      <div className="loading-fullpage">
        <div className={`spinner ${sizeClass}`}></div>
      </div>
    );
  }
  
  return (
    <div className="loading-spinner">
      <div className={`spinner ${sizeClass}`}></div>
    </div>
  );
};

export default LoadingSpinner;