import React from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert } from 'lucide-react';

export const EmergencyBanner = ({ message, numbers = ['112', '108'], className = '' }) => {
  return (
    <div
      className={`rounded-2xl p-5 bg-red-50 border-2 border-alert/30 text-ink shadow-neumorph-sm ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-alert text-white flex-shrink-0 animate-pulse">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-alert text-base tracking-wide uppercase">
              Urgent Medical Alert
            </h4>
            <span className="px-2 py-0.5 rounded-full bg-alert text-white text-[10px] font-bold uppercase tracking-wider animate-bounce">
              Immediate Care
            </span>
          </div>

          <p className="mt-1 text-sm font-medium text-ink leading-relaxed">
            {message ||
              'Red-flag emergency symptoms detected. Online consultation is not safe for this condition. Please call emergency services or proceed immediately to the nearest hospital emergency room.'}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {numbers.map((num) => (
              <a
                key={num}
                href={`tel:${num}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-alert text-white text-sm font-bold shadow-md hover:bg-red-700 active:scale-95 transition"
              >
                <PhoneCall className="w-4 h-4 animate-pulse" />
                <span>Call {num} (National Emergency)</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyBanner;

