import React from 'react';

export const AvailabilityChip = ({ label = 'Today Available', className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-limeChip text-ink text-xs font-semibold shadow-sm ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-leaf animate-pulse"></span>
      <span className="truncate">{label}</span>
    </span>
  );
};

export default AvailabilityChip;
