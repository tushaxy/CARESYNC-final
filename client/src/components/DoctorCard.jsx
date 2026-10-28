import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, MapPin, Languages, Clock, Video } from 'lucide-react';
import RatingStars from './RatingStars';
import AvailabilityChip from './AvailabilityChip';
import { formatRupee } from '../lib/format';

export const DoctorCard = ({ doctor, className = '' }) => {
  const navigate = useNavigate();

  // Extract initials
  const initials = doctor.name
    .replace('Dr. ', '')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');

  const hue = doctor.avatarHue || 145;

  return (
    <div
      className={`bg-paper rounded-clinic p-6 shadow-neumorph hover:shadow-neumorph-lg transition-all duration-200 flex flex-col justify-between border border-mint/40 ${className}`}
    >
      <div>
        {/* Top Header: Avatar & Info */}
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-ink font-extrabold text-lg shadow-sm border border-white"
              style={{
                background: `linear-gradient(135deg, hsl(${hue}, 70%, 88%), hsl(${hue}, 60%, 75%))`,
              }}
            >
              {initials}
            </div>
            {doctor.verified && (
              <span
                title="Verified Healthcare Professional"
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-forest text-limeChip flex items-center justify-center border-2 border-paper"
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h3 className="text-base font-bold text-ink truncate hover:text-forest">
                <Link to={`/doctors/${doctor.docId}`}>{doctor.name}</Link>
              </h3>
            </div>
            <p className="text-xs font-semibold text-leaf truncate">
              {doctor.specialization}
            </p>
            <p className="text-xs text-sage truncate mt-0.5">
              {doctor.qualifications} • {doctor.experienceYears} yrs exp
            </p>
          </div>
        </div>

        {/* Rating and Meta */}
        <div className="mt-4 flex items-center justify-between">
          <RatingStars rating={doctor.rating} count={doctor.reviewCount} />
          <AvailabilityChip label={doctor.nextAvailableLabel || 'Today Available'} />
        </div>

        {/* Clinic & Distance */}
        <div className="mt-3.5 space-y-1.5 text-xs text-sage">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-leaf flex-shrink-0" />
            <span className="truncate">
              {doctor.clinicArea}
              {doctor.distanceKm != null && ` (${doctor.distanceKm} km away)`}
            </span>
          </div>

          {doctor.languages && (
            <div className="flex items-center gap-1.5 truncate">
              <Languages className="w-3.5 h-3.5 text-leaf flex-shrink-0" />
              <span className="truncate">
                {Array.isArray(doctor.languages) ? doctor.languages.join(', ') : doctor.languages}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Fee & CTA */}
      <div className="mt-5 pt-4 border-t border-mint/50 flex items-center justify-between gap-3">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-sage font-medium block">
            Video Fee
          </span>
          <span className="text-lg font-extrabold text-forest tabular-nums">
            {formatRupee(doctor.videoConsultFee)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/doctors/${doctor.docId}`}
            className="px-3 py-2 rounded-full text-xs font-semibold text-forest bg-mint/70 hover:bg-mint transition"
          >
            Profile
          </Link>
          <button
            onClick={() => navigate(`/book/${doctor.docId}`)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-forest hover:bg-evergreen active:scale-95 shadow-sm transition"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Book</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
