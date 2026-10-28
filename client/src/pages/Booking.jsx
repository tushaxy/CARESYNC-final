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
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatRupee, formatDate, formatTime } from '../lib/format';
import Skeleton from '../components/Skeleton';

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
          // If no slot was passed in state, pick next available slot
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

  const handlePayment = async () => {
    if (!slotISO) {
      showToast('Please select a valid consultation time slot', 'error');
      return;
    }

    setProcessingPayment(true);

    try {
      // 1. Create pending appointment + Razorpay order
      const createRes = await api.post('/appointments', {
        docId: doctor.docId,
        slotISO,
        mode,
        note: patientNote,
      });

      const { appointment, razorpayOrder } = createRes.data;

      // 2. Open Razorpay Checkout or fallback verification
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag';

      if (window.Razorpay && !razorpayKey.includes('xxxx')) {
        const options = {
          key: razorpayKey,
          amount: razorpayOrder.amount,
          currency: 'INR',
          name: 'CareSync Telemedicine',
          description: `Consultation with ${doctor.name}`,
          order_id: razorpayOrder.id,
          theme: { color: '#14532D' },
          prefill: {
            name: user?.name || 'CareSync Patient',
            email: user?.email || 'patient@caresync.in',
            contact: user?.phone || '9876543210',
          },
          handler: async (response) => {
            try {
              // Verify payment on server
              const verifyRes = await api.post('/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              showToast('Payment verified successfully! Slot reserved.', 'success');
              navigate(`/booking/success/${appointment._id}`, {
                state: { appointment: verifyRes.data.appointment },
              });
            } catch (vErr) {
              console.error('Signature verification failed:', vErr);
              showToast('Payment verification failed on server', 'error');
              navigate('/dashboard');
            }
          },
          modal: {
            ondismiss: () => {
              setProcessingPayment(false);
              showToast('Payment dismissed. Appointment saved as pending.', 'info');
              navigate('/dashboard');
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Direct test verification pass-through (e.g. if external script is blocked in environment)
        const mockPaymentId = `pay_test_${Date.now()}`;
        const verifyRes = await api.post('/payments/verify', {
          razorpay_order_id: razorpayOrder.id,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: 'demo_signature_valid',
        });

        showToast('Test payment processed successfully!', 'success');
        navigate(`/booking/success/${appointment._id}`, {
          state: { appointment: verifyRes.data.appointment },
        });
      }
    } catch (err) {
      console.error('Booking error:', err);
      showToast(err.response?.data?.message || 'Failed to initialize booking order', 'error');
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
                  mode === 'video'
                    ? 'bg-forest text-white'
                    : 'bg-mist text-sage hover:text-ink'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video Call</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('clinic')}
                className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  mode === 'clinic'
                    ? 'bg-forest text-white'
                    : 'bg-mist text-sage hover:text-ink'
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
          <span>{processingPayment ? 'Opening Razorpay Gateway...' : 'Pay Securely with Razorpay (Test)'}</span>
        </button>

        {/* Razorpay Test Mode Note */}
        <div className="p-3 bg-mint/50 rounded-xl text-[11px] text-sage flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-leaf flex-shrink-0" />
          <span>
            <strong>Razorpay Test Mode:</strong> No real money moves. Use test card <code className="font-mono font-bold text-forest">4111 1111 1111 1111</code> with any future expiry date and any 3-digit CVV.
          </span>
        </div>
      </div>
    </div>
  );
};

export default Booking;
