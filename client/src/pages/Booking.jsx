import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Video,
  Building,
  Calendar,
  Clock,
  User,
  CreditCard,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  X,
  Smartphone,
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatRupee, formatDate, formatTime } from '../lib/format';
import Skeleton from '../components/Skeleton';
import RazorpayModal from '../components/RazorpayModal';

export const Booking = () => {
  const { docId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [doctor, setDoctor] = useState(null);
  const [slotISO, setSlotISO] = useState(location.state?.slotISO || null);
  const [mode, setMode] = useState(location.state?.mode || 'video');
  const [patientNote, setPatientNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Test simulation modal state
  const [showTestModal, setShowTestModal] = useState(false);
  const [pendingAppointment, setPendingAppointment] = useState(null);
  const [pendingRazorpayOrder, setPendingRazorpayOrder] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    api
      .get(`/doctors/${docId}`)
      .then((res) => {
        setDoctor(res.data?.doctor || null);
        if (!slotISO) {
          api.get(`/doctors/${docId}/slots`).then((sRes) => {
            const openSlot = sRes.data?.slots?.find((s) => s.status === 'open');
            if (openSlot) {
              setSlotISO(openSlot.startsAt);
            }
          });
        }
      })
      .catch((err) => {
        console.error('Error loading doctor for booking:', err);
        showToast('Could not load booking details', 'error');
      })
      .finally(() => setLoading(false));
  }, [docId, isAuthenticated]);

  if (loading || !doctor) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-4">
        <Skeleton className="h-48 w-full rounded-clinic" />
        <Skeleton className="h-64 w-full rounded-clinic" />
      </div>
    );
  }

  const fee = mode === 'clinic' ? doctor.clinicConsultFee : doctor.videoConsultFee;

  // Complete verification helper
  const completePaymentVerification = async (orderId, paymentId, signature, apptId) => {
    try {
      const verifyRes = await api.post('/payments/verify', {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      });

      showToast('Payment verified successfully! Slot reserved.', 'success');
      navigate(`/booking/success/${apptId}`, {
        state: { appointment: verifyRes.data.appointment },
      });
    } catch (vErr) {
      console.error('Signature verification failed:', vErr);
      showToast('Payment verification failed on server', 'error');
      navigate('/dashboard');
    } finally {
      setProcessingPayment(false);
      setShowTestModal(false);
    }
  };

  const handlePayment = async () => {
    if (!slotISO) {
      showToast('Please select a valid consultation time slot', 'error');
      return;
    }

    setProcessingPayment(true);

    try {
      // 1. Create pending appointment + Razorpay order on server
      const createRes = await api.post('/appointments', {
        docId: doctor.docId,
        slotISO,
        mode,
        note: patientNote,
      });

      const { appointment, razorpayOrder } = createRes.data;
      setPendingAppointment(appointment);
      setPendingRazorpayOrder(razorpayOrder);

      // Open Razorpay Checkout Popup
      setShowTestModal(true);
    } catch (err) {
      console.error('Booking error:', err);
      showToast(err.response?.data?.message || 'Failed to initialize booking order', 'error');
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="min-h-screen py-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <span className="text-xs font-extrabold uppercase tracking-widest text-leaf block mb-1">
          CHECKOUT & CONFIRMATION
        </span>
        <h1 className="text-3xl font-extrabold text-ink">Confirm Consultation Booking</h1>
      </div>

      <div className="bg-paper rounded-clinic p-6 sm:p-8 shadow-neumorph-lg border border-mint/60 space-y-6">
        {/* Doctor Mini-Row */}
        <div className="p-4 rounded-2xl bg-mist flex items-center justify-between gap-4 border border-mint/60">
          <div>
            <span className="text-[11px] font-bold text-leaf uppercase tracking-wider block">
              Consulting Doctor
            </span>
            <h3 className="text-lg font-bold text-ink">{doctor.name}</h3>
            <p className="text-xs text-sage">
              {doctor.specialization} • {doctor.clinicArea}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-sage block">Consultation Fee</span>
            <span className="text-xl font-extrabold text-forest tabular-nums">
              {formatRupee(fee)}
            </span>
          </div>
        </div>

        {/* Chosen Slot & Mode Toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-paper border border-mint shadow-xs">
            <span className="text-[11px] font-bold text-sage uppercase tracking-wider block mb-1">
              Time Slot (IST)
            </span>
            <div className="flex items-center gap-2 text-sm font-extrabold text-ink">
              <Calendar className="w-4 h-4 text-forest" />
              <span>{slotISO ? formatDate(slotISO) : 'Next Available'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-leaf mt-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{slotISO ? formatTime(slotISO) : '5:00 PM'}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-paper border border-mint shadow-xs">
            <span className="text-[11px] font-bold text-sage uppercase tracking-wider block mb-2">
              Consultation Mode
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMode('video')}
                className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  mode === 'video' ? 'bg-forest text-white' : 'bg-mist text-sage hover:text-ink'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video Call</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('clinic')}
                className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  mode === 'clinic' ? 'bg-forest text-white' : 'bg-mist text-sage hover:text-ink'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>In-Clinic</span>
              </button>
            </div>
          </div>
        </div>

        {/* Patient Symptom Note */}
        <div>
          <label className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
            Patient Symptoms & Clinical Note (Optional)
          </label>
          <textarea
            rows="3"
            value={patientNote}
            onChange={(e) => setPatientNote(e.target.value)}
            placeholder="Briefly state symptoms, duration, or any past medical history for the doctor..."
            className="w-full p-4 rounded-2xl text-xs sm:text-sm bg-mist clinic-inset border-none focus:outline-none focus:ring-1 focus:ring-forest text-ink placeholder:text-sage"
          />
        </div>

        {/* Fee Breakdown */}
        <div className="pt-4 border-t border-mint space-y-2 text-xs">
          <div className="flex justify-between items-center text-sage">
            <span>Consultation Fee</span>
            <span className="font-bold text-ink tabular-nums">{formatRupee(fee)}</span>
          </div>
          <div className="flex justify-between items-center text-sage">
            <span>Platform Convenience Fee</span>
            <span className="font-bold text-leaf">₹0 (Free)</span>
          </div>
          <div className="flex justify-between items-center text-sage">
            <span>Taxes & GST (18%)</span>
            <span className="font-bold text-leaf">Included</span>
          </div>
          <div className="flex justify-between items-center pt-2 text-sm font-extrabold text-forest border-t border-mint">
            <span>Total Amount Due</span>
            <span className="text-2xl tabular-nums">{formatRupee(fee)}</span>
          </div>
        </div>

        {/* Pay Securely Button */}
        <button
          onClick={handlePayment}
          disabled={processingPayment}
          className="w-full py-4 rounded-full text-sm font-bold text-white bg-forest hover:bg-evergreen active:scale-95 shadow-neumorph transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <CreditCard className="w-4 h-4" />
          <span>{processingPayment ? 'Connecting Payment Gateway...' : 'Pay Securely with Razorpay (Test)'}</span>
        </button>

        {/* Razorpay Test Mode Note */}
        <div className="p-3 bg-mint/50 rounded-xl text-[11px] text-sage flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-leaf flex-shrink-0" />
          <span>
            <strong>Razorpay Test Mode:</strong> Use test card <code className="font-mono font-bold text-forest">4111 1111 1111 1111</code> or instant simulation. No real money moves.
          </span>
        </div>
      </div>

      {/* ===================== AUTHENTIC RAZORPAY CHECKOUT POPUP ===================== */}
      <RazorpayModal
        isOpen={showTestModal}
        onClose={() => setShowTestModal(false)}
        amountInRupees={fee}
        doctorName={doctor.name}
        user={user}
        appointmentId={pendingAppointment?._id}
        orderId={pendingRazorpayOrder?.id}
        onSuccess={(paymentData) => {
          completePaymentVerification(
            paymentData.razorpay_order_id,
            paymentData.razorpay_payment_id,
            paymentData.razorpay_signature,
            pendingAppointment._id
          );
        }}
      />
    </div>
  );
};

export default Booking;
