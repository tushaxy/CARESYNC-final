import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Check,
  MapPin,
  Languages,
  Calendar,
  Clock,
  Video,
  Building,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  Info,
} from 'lucide-react';
import api from '../lib/api';
import RatingStars from '../components/RatingStars';
import AvailabilityChip from '../components/AvailabilityChip';
import Skeleton from '../components/Skeleton';
import { formatRupee, formatDate, formatTime } from '../lib/format';
import { useToast } from '../context/ToastContext';

export const DoctorDetail = () => {
  const { docId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [doctor, setDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(0); // 0 to 6 days
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [consultMode, setConsultMode] = useState('video');
  const [loading, setLoading] = useState(true);

  // Load doctor details and slots
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/doctors/${docId}`),
      api.get(`/doctors/${docId}/slots`),
    ])
      .then(([docRes, slotRes]) => {
        setDoctor(docRes.data?.doctor || null);
        setSlots(slotRes.data?.slots || []);
      })
      .catch((err) => {
        console.error('Error loading doctor details:', err);
        showToast('Could not load doctor profile', 'error');
      })
      .finally(() => setLoading(false));
  }, [docId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-64 w-full rounded-clinic" />
        <Skeleton className="h-40 w-full rounded-clinic" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-ink mb-2">Doctor Profile Not Found</h2>
        <p className="text-sm text-sage mb-6">The requested doctor could not be retrieved.</p>
        <button
          onClick={() => navigate('/doctors')}
          className="px-6 py-2.5 rounded-full bg-forest text-white text-xs font-bold"
        >
          Return to Doctors Directory
        </button>
      </div>
    );
  }

  // Generate next 7 days for the date strip
  const daysList = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    daysList.push(d);
  }

  const currentDateObj = daysList[selectedDate];
  const currentDateString = currentDateObj.toISOString().split('T')[0];

  // Filter slots for the selected day
  const daySlots = slots.filter((slot) => {
    const slotDateStr = new Date(slot.startsAt).toISOString().split('T')[0];
    return slotDateStr === currentDateString;
  });

  const initials = doctor.name
    .replace('Dr. ', '')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');

  const hue = doctor.avatarHue || 145;
  const currentFee = consultMode === 'video' ? doctor.videoConsultFee : doctor.clinicConsultFee;

  const handleProceedToBooking = () => {
    if (!selectedSlot) {
      showToast('Please pick an available consultation time slot first', 'info');
      return;
    }

    navigate(`/book/${doctor.docId}`, {
      state: {
        slotISO: selectedSlot.startsAt,
        mode: consultMode,
        fee: currentFee,
      },
    });
  };

  return (
    <div className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-sage mb-6">
        <span onClick={() => navigate('/doctors')} className="hover:text-forest cursor-pointer">
          Doctors
        </span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-semibold text-ink">{doctor.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Doctor Profile & Slots */}
        <div className="lg:col-span-8 space-y-8">
          {/* Profile Header Card */}
          <div className="bg-paper rounded-clinic p-6 sm:p-8 shadow-neumorph border border-mint/50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative flex-shrink-0">
                <div
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center text-ink font-extrabold text-3xl shadow-sm border-2 border-white"
                  style={{
                    background: `linear-gradient(135deg, hsl(${hue}, 75%, 85%), hsl(${hue}, 60%, 72%))`,
                  }}
                >
                  {initials}
                </div>
                {doctor.verified && (
                  <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-forest text-limeChip flex items-center gap-1 text-[10px] font-bold border-2 border-paper">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>Verified</span>
                  </span>
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">{doctor.name}</h1>
                  <span className="px-3 py-0.5 rounded-full bg-mint text-forest text-xs font-bold">
                    {doctor.specialization}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-sage font-medium">
                  {doctor.qualifications} • {doctor.experienceYears} Years Clinical Experience
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <RatingStars rating={doctor.rating} count={doctor.reviewCount} size={18} />
                  <AvailabilityChip label={doctor.nextAvailableLabel || 'Today Available'} />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-sage">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-leaf" />
                    <span>{doctor.clinicArea}, Bengaluru</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Languages className="w-4 h-4 text-leaf" />
                    <span>{doctor.languages?.join(', ')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* About Paragraph */}
            <div className="mt-8 pt-6 border-t border-mint/60">
              <h3 className="text-sm font-bold uppercase tracking-wider text-ink mb-2">
                About the Practitioner
              </h3>
              <p className="text-xs sm:text-sm text-sage leading-relaxed">{doctor.about}</p>
            </div>

            {/* Consultation Fee Tiles */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                onClick={() => setConsultMode('video')}
                className={`p-4 rounded-2xl cursor-pointer transition border ${
                  consultMode === 'video'
                    ? 'bg-mint/80 border-forest shadow-sm'
                    : 'bg-mist border-mint/60 hover:bg-mint/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-forest font-bold text-sm">
                    <Video className="w-4 h-4" />
                    <span>Video Consultation</span>
                  </div>
                  {consultMode === 'video' && <Check className="w-4 h-4 text-forest" />}
                </div>
                <div className="mt-2 text-xl font-extrabold text-forest tabular-nums">
                  {formatRupee(doctor.videoConsultFee)}
                </div>
                <p className="text-[11px] text-sage mt-0.5">Encrypted WebRTC call from home</p>
              </div>

              <div
                onClick={() => setConsultMode('clinic')}
                className={`p-4 rounded-2xl cursor-pointer transition border ${
                  consultMode === 'clinic'
                    ? 'bg-mint/80 border-forest shadow-sm'
                    : 'bg-mist border-mint/60 hover:bg-mint/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-forest font-bold text-sm">
                    <Building className="w-4 h-4" />
                    <span>In-Clinic Visit</span>
                  </div>
                  {consultMode === 'clinic' && <Check className="w-4 h-4 text-forest" />}
                </div>
                <div className="mt-2 text-xl font-extrabold text-forest tabular-nums">
                  {formatRupee(doctor.clinicConsultFee)}
                </div>
                <p className="text-[11px] text-sage mt-0.5">Visit {doctor.clinicArea} clinic</p>
              </div>
            </div>
          </div>

          {/* 7-Day Date Strip & Slot Grid (Section 11 requirement) */}
          <div className="bg-paper rounded-clinic p-6 sm:p-8 shadow-neumorph border border-mint/50">
            <h3 className="text-base font-extrabold text-ink mb-1">Select Consultation Time</h3>
            <p className="text-xs text-sage mb-6">
              Slots are shown in Indian Standard Time (IST).
            </p>

            {/* 7-Day Date Strip */}
            <div className="grid grid-cols-7 gap-2 pb-4 border-b border-mint/60 overflow-x-auto no-scrollbar">
              {daysList.map((d, index) => {
                const isSelected = selectedDate === index;
                const isToday = index === 0;

                return (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedDate(index);
                      setSelectedSlot(null);
                    }}
                    className={`p-2.5 rounded-2xl flex flex-col items-center justify-center transition min-w-[50px] ${
                      isSelected
                        ? 'bg-forest text-white shadow-sm'
                        : 'bg-mist hover:bg-mint/50 text-ink'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                      {isToday ? 'Today' : d.toLocaleDateString('en-IN', { weekday: 'short' })}
                    </span>
                    <span className="text-base font-extrabold tabular-nums mt-0.5">
                      {d.getDate()}
                    </span>
                    <span className="text-[10px] opacity-70">
                      {d.toLocaleDateString('en-IN', { month: 'short' })}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Slot Grid */}
            <div className="mt-6">
              <span className="text-xs font-bold text-forest uppercase tracking-wider block mb-3">
                Available Slots for {formatDate(currentDateObj)}
              </span>

              {daySlots.length === 0 ? (
                <p className="text-xs text-sage py-6 text-center">
                  No slots currently configured for this date.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {daySlots.map((slot) => {
                    const isBooked = slot.status === 'booked';
                    const isPicked = selectedSlot?._id === slot._id;

                    return (
                      <button
                        key={slot._id}
                        disabled={isBooked}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center tabular-nums ${
                          isBooked
                            ? 'bg-mist text-sage/40 line-through cursor-not-allowed border border-mint/20'
                            : isPicked
                            ? 'bg-forest text-white shadow-sm'
                            : 'bg-paper text-ink clinic-inset hover:bg-mint/60 border border-mint/60'
                        }`}
                      >
                        {formatTime(slot.startsAt)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Booking Summary Card */}
        <div className="lg:col-span-4 sticky top-28">
          <div className="bg-paper rounded-clinic p-6 shadow-neumorph-lg border border-mint/60 space-y-6">
            <h3 className="text-base font-extrabold text-ink border-b border-mint/60 pb-3">
              Booking Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-sage">
                <span>Practitioner</span>
                <strong className="text-ink">{doctor.name}</strong>
              </div>

              <div className="flex justify-between items-center text-sage">
                <span>Mode</span>
                <span className="capitalize font-bold text-forest">{consultMode}</span>
              </div>

              <div className="flex justify-between items-center text-sage">
                <span>Date & Time</span>
                <span className="font-bold text-ink">
                  {selectedSlot ? formatTime(selectedSlot.startsAt) : 'Slot not chosen'}
                </span>
              </div>

              <div className="flex justify-between items-center text-sage">
                <span>Consultation Fee</span>
                <span className="font-extrabold text-forest text-sm tabular-nums">
                  {formatRupee(currentFee)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sage">
                <span>Platform Fee</span>
                <span className="text-leaf font-bold">FREE (₹0)</span>
              </div>
            </div>

            <div className="pt-4 border-t border-mint flex items-center justify-between">
              <span className="text-xs font-bold text-ink uppercase">Total Payable</span>
              <span className="text-2xl font-extrabold text-forest tabular-nums">
                {formatRupee(currentFee)}
              </span>
            </div>

            <button
              onClick={handleProceedToBooking}
              className="w-full py-3.5 rounded-full text-xs sm:text-sm font-bold text-white bg-forest hover:bg-evergreen active:scale-95 shadow-neumorph transition flex items-center justify-center gap-2"
            >
              <span>Continue to Secure Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-sage">
              <ShieldCheck className="w-3.5 h-3.5 text-leaf" />
              <span>Razorpay Test Mode • 100% Secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetail;
