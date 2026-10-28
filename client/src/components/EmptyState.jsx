import React from 'react';
import { Search } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Search,
  title = 'No records found',
  description = 'Try adjusting your search criteria or filters.',
  action,
  className = '',
}) => {
  return (
    <div className={`text-center py-12 px-4 max-w-md mx-auto ${className}`}>
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-mint flex items-center justify-center text-forest shadow-neumorph-sm">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-ink mb-1">{title}</h3>
      <p className="text-sm text-sage mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;

