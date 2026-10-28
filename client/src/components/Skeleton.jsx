import React from 'react';

export const Skeleton = ({ className = '', rounded = 'rounded-xl' }) => {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-mint/50 via-mint/80 to-mint/50 ${rounded} ${className}`}
    />
  );
};

export const DoctorCardSkeleton = () => (
  <div className="bg-paper rounded-clinic p-6 shadow-neumorph flex flex-col justify-between h-[310px]">
    <div className="flex items-center gap-4">
      <Skeleton className="w-14 h-14 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
    <div className="space-y-3 my-4">
      <Skeleton className="h-4 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
    </div>
    <div className="flex items-center justify-between pt-3 border-t border-mint/60">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-9 w-28 rounded-full" />
    </div>
  </div>
);

export const ProductCardSkeleton = () => (
  <div className="bg-paper rounded-clinic p-5 shadow-neumorph flex flex-col justify-between h-[340px]">
    <Skeleton className="h-36 w-full rounded-2xl" />
    <div className="space-y-2 mt-3">
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-5 w-4/5" />
      <Skeleton className="h-3 w-full" />
    </div>
    <div className="flex items-center justify-between pt-4 mt-2 border-t border-mint/60">
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-9 w-24 rounded-full" />
    </div>
  </div>
);

export default Skeleton;
