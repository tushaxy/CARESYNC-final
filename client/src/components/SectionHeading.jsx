import React from 'react';

export const SectionHeading = ({
  overline,
  title,
  highlight,
  subtitle,
  align = 'left',
  numeral,
  className = '',
}) => {
  const isCenter = align === 'center';

  return (
    <div className={`mb-10 ${isCenter ? 'text-center mx-auto max-w-2xl' : 'max-w-3xl'} ${className}`}>
      {overline && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint text-forest text-xs font-semibold tracking-wider uppercase mb-3">
          {numeral && <span className="text-leaf font-bold">{numeral}</span>}
          <span>{overline}</span>
        </div>
      )}

      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ink leading-tight">
        {title}{' '}
        {highlight && (
          <span className="relative inline-block text-forest">
            {highlight}
            <span className="absolute bottom-1 left-0 right-0 h-2 bg-limeChip/60 -z-10 rounded-sm"></span>
          </span>
        )}
      </h2>

      {subtitle && (
        <p className="mt-3 text-sm sm:text-base text-sage leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
