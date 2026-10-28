import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Copy,
  Check,
  Calendar,
  Clock,
  Video,
  ArrowRight,
  Download,
  Share2,
} from 'lucide-react';
import api from '../lib/api';
import { useToast } from '../context/ToastContext';
import { formatDate, formatTime } from '../lib/format';
import Skeleton from '../components/Skeleton';

export const BookingSuccess = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [appointment, setAppointment] = useState(location.state?.appointment || null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(!appointment);

  useEffect(() => {
    if (!appointment) {
      api
        .get(`/appointments/${id}`)
        .then((res) => {
          setAppointment(res.data?.appointment);
        })
        .catch((err) => {
          console.error('Error fetching appointment:', err);
          showToast('Could not load appointment details', 'error');
        })
        .finally(() => setLoading(false));
    }
  }, [id, appointment]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <Skeleton className="h-64 w-full rounded-clinic" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-ink">Appointment details unavailable</h2>
        <Link to="/dashboard" className="mt-4 inline-block text-forest underline font-bold">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  // Doctor invite link: doctors join via the same consult room link
  const consultUrl = `${window.location.origin}/consult/${appointment._id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(consultUrl);
    setCopied(true);
    showToast('Doctor consult room link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  // Generate and download .ics calendar file
  const handleDownloadICS = () => {
    const start = new Date(appointment.slotISO);
    const end = new Date(start.getTime() + 30 * 60 * 1000); // 30 min consult

    const formatDateForICS = (d) =>
      d.toISOString().replace(/-|:|\.\d+/g, '');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CareSync//Telehealth Appointment//EN',
      'BEGIN:VEVENT',
      `UID:caresync-${appointment._id}@caresync.in`,
      `DTSTAMP:${formatDateForICS(new Date())}`,
      `DTSTART:${formatDateForICS(start)}`,
      `DTEND:${formatDateForICS(end)}`,
      `SUMMARY:CareSync Video Consultation — Dr. ${appointment.doctor?.name || appointment.doctorId}`,
      `DESCRIPTION:Join private consultation: ${consultUrl}`,
      `LOCATION:${consultUrl}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `CareSync-Appointment-${appointment._id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Calendar .ics file downloaded!', 'success');
  };

  return (
    <div className="min-h-screen py-12 max-w-2xl mx-auto px-4 sm:px-6">
      {/* Mint Check Medallion with pop animation */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-mint text-forest flex items-center justify-center shadow-neumorph-lg animate-in zoom-in-75 duration-300">
          <CheckCircle2 className="w-12 h-12 text-forest stroke-[2.5]" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-leaf block mb-1">
          PAYMENT VERIFIED & CONFIRMED
        </span>
        <h1 className="text-3xl font-extrabold text-ink">Consultation Booked!</h1>
        <p className="text-xs sm:text-sm text-sage mt-2">
          Your video room is reserved. We have saved the appointment to your dashboard.
        </p>
      </div>

      {/* Appointment Summary Card */}
      <div className="bg-paper rounded-clinic p-6 sm:p-8 shadow-neumorph-lg border border-mint/60 space-y-6">
        <div className="p-4 rounded-2xl bg-mist border border-mint/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-leaf">
              Practitioner
            </span>
            <h3 className="text-base font-extrabold text-ink">
              {appointment.doctor?.name || `Doctor ID: ${appointment.doctorId}`}
            </h3>
            <p className="text-xs text-sage">
              {appointment.doctor?.specialization || 'Medical Specialist'}
            </p>
          </div>

          <div className="text-right">
            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-limeChip text-forest">
              PAID (TEST)
            </span>
          </div>
        </div>

        {/* Date and Room info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-paper border border-mint flex items-center gap-3">
            <Calendar className="w-5 h-5 text-forest" />
            <div>
              <span className="text-[10px] text-sage uppercase font-bold block">Scheduled Date</span>
              <span className="font-extrabold text-ink">{formatDate(appointment.slotISO)}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-paper border border-mint flex items-center gap-3">
            <Clock className="w-5 h-5 text-forest" />
            <div>
              <span className="text-[10px] text-sage uppercase font-bold block">Slot Time (IST)</span>
              <span className="font-extrabold text-ink">{formatTime(appointment.slotISO)}</span>
            </div>
          </div>
        </div>

        {/* Copy Invite Link & Add to Calendar */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleCopyLink}
            className="flex-1 py-3 px-4 rounded-full text-xs font-bold text-forest bg-mint hover:bg-limeChip transition flex items-center justify-center gap-2 border border-mint"
          >
            {copied ? <Check className="w-4 h-4 text-forest" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Link Copied!' : 'Copy Invite Link for Doctor'}</span>
          </button>

          <button
            onClick={handleDownloadICS}
            className="flex-1 py-3 px-4 rounded-full text-xs font-bold text-forest bg-mint hover:bg-limeChip transition flex items-center justify-center gap-2 border border-mint"
          >
            <Download className="w-4 h-4" />
            <span>Add to Calendar (.ics)</span>
          </button>
        </div>

        {/* Three-step How Your Consult Works Strip */}
        <div className="pt-6 border-t border-mint space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink">
            How your consult works
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-sage">
            <div className="p-3 rounded-xl bg-mist border border-mint/40">
              <strong className="text-forest block mb-0.5">1. Preflight Check</strong>
              Test your camera and microphone in the room.
            </div>
            <div className="p-3 rounded-xl bg-mist border border-mint/40">
              <strong className="text-forest block mb-0.5">2. Doctor Joins</strong>
              Share the invite link so the doctor joins your private room.
            </div>
            <div className="p-3 rounded-xl bg-mist border border-mint/40">
              <strong className="text-forest block mb-0.5">3. Digital Rx</strong>
              Prescription appears in your vault right after consult.
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-mint flex flex-col sm:flex-row gap-3">
          <Link
            to={`/consult/${appointment._id}`}
            className="flex-1 py-3.5 rounded-full text-center text-xs sm:text-sm font-bold text-white bg-forest hover:bg-evergreen transition shadow-sm flex items-center justify-center gap-2"
          >
            <Video className="w-4 h-4" />
            <span>Enter Video Consult Room Now</span>
          </Link>

          <Link
            to="/dashboard"
            className="py-3.5 px-6 rounded-full text-center text-xs sm:text-sm font-bold text-forest bg-paper border border-mint hover:bg-mist transition"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
