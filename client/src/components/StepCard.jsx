import React from 'react';

export const StepCard = ({ numeral, icon: Icon, title, description }) => {
  return (
    <div className="bg-paper rounded-clinic p-6 shadow-neumorph hover:shadow-neumorph-lg transition-all duration-200 border border-mint/40 relative overflow-hidden flex flex-col justify-between h-full">
      {/* Top numeral and icon */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl font-extrabold text-forest/20 tracking-tighter tabular-nums">
          {numeral}
        </span>
        <div className="w-12 h-12 rounded-2xl bg-mint/80 flex items-center justify-center text-forest shadow-xs">
          <Icon className="w-6 h-6 text-forest" />
        </div>
      </div>

      <div>
        <h4 className="text-base font-extrabold text-ink mb-2">
          {title}
        </h4>
        <p className="text-xs sm:text-sm text-sage leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export default StepCard;

