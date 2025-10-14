import React from 'react';

export const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }) => {
  return (
    <div className="loading-spinner-container" role="status" aria-live="polite">
      <div className={`spinner spinner-${size}`} aria-hidden="true"></div>
      {message && <p className="sr-only">{message}</p>}
      <span className="sr-only">Loading content, please wait...</span>
    </div>
  );
};

export default LoadingSpinner;
