import React from 'react';

export const SoftCard = ({ children, className = '', hover = true, onClick, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-paper rounded-clinic p-6 transition-all duration-200 ${
        hover ? 'clinic-card' : 'shadow-neumorph'
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default SoftCard;

