import React from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({ rating = 4.8, count, size = 16, className = '' }) => {
  const safeRating = Number(rating) || 4.8;
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center text-gold">
        <Star className="fill-gold stroke-gold" style={{ width: size, height: size }} />
      </div>
      <span className="text-xs sm:text-sm font-bold text-ink tabular-nums">
        {safeRating.toFixed(1)}
      </span>
      {count != null && (
        <span className="text-xs text-sage tabular-nums">
          ({Number(count || 0).toLocaleString('en-IN')})
        </span>
      )}
    </div>
  );
};

export default RatingStars;

