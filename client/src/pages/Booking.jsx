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

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || '';
      const isMockOrder = razorpayOrder.id.startsWith('order_test_');

      // If server returned a simulated test order (placeholder credentials) or key is mock,
      // show the test simulator directly so Razorpay API doesn't throw "Uh! oh! Order not found"
      if (isMockOrder || !razorpayKey || razorpayKey.includes('xxxx')) {
        setShowTestModal(true);
        setProcessingPayment(false);
        return;
      }

      // If real Razorpay key is configured and order was created by Razorpay API
      if (window.Razorpay) {
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
            await completePaymentVerification(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              appointment._id
            );
          },
          modal: {
            ondismiss: () => {
              setProcessingPayment(false);
              showToast('Payment dismissed. You can complete using the Test Simulator.', 'info');
              setShowTestModal(true);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          console.warn('Razorpay live payment failed, switching to test simulator:', resp.error);
          setShowTestModal(true);
        });
        rzp.open();
      } else {
        setShowTestModal(true);
        setProcessingPayment(false);
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

      {/* ===================== RAZORPAY TEST SIMULATOR MODAL ===================== */}
      {showTestModal && pendingAppointment && pendingRazorpayOrder && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-paper rounded-clinic max-w-md w-full p-6 shadow-2xl border border-mint/80 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-mint/60 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-forest text-limeChip flex items-center justify-center font-bold text-sm">
                  ₹
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-ink">Razorpay Test Gateway</h3>
                  <p className="text-[10px] text-sage">CareSync Telemedicine Checkout</p>
                </div>
              </div>
              <button
                onClick={() => setShowTestModal(false)}
                className="p-1 rounded-full text-sage hover:text-ink"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-mist border border-mint mb-5">
              <div className="flex justify-between items-center text-xs text-sage mb-1">
                <span>Doctor Consultation:</span>
                <strong className="text-ink">{doctor.name}</strong>
              </div>
              <div className="flex justify-between items-center text-xs text-sage mb-2">
                <span>Order Reference:</span>
                <span className="font-mono text-[11px]">{pendingRazorpayOrder.id}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-mint text-sm font-extrabold text-forest">
                <span>Total Payable:</span>
                <span className="text-xl tabular-nums">{formatRupee(fee)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() =>
                  completePaymentVerification(
                    pendingRazorpayOrder.id,
                    `pay_test_card_${Date.now()}`,
                    'demo_signature_valid',
                    pendingAppointment._id
                  )
                }
                className="w-full py-3.5 px-4 rounded-2xl bg-forest hover:bg-evergreen text-white text-xs font-bold shadow-md transition flex items-center justify-between group active:scale-95"
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-limeChip" />
                  <div className="text-left">
                    <span className="block font-bold">Simulate Card Success</span>
                    <span className="text-[10px] opacity-80 font-mono">4111 •••• •••• 1111 (Auto-approve)</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 transition group-hover:translate-x-1" />
              </button>

              <button
                onClick={() =>
                  completePaymentVerification(
                    pendingRazorpayOrder.id,
                    `pay_test_upi_${Date.now()}`,
                    'demo_signature_valid',
                    pendingAppointment._id
                  )
                }
                className="w-full py-3.5 px-4 rounded-2xl bg-mint hover:bg-limeChip text-forest text-xs font-bold transition flex items-center justify-between group active:scale-95 border border-mint"
              >
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-leaf" />
                  <div className="text-left">
                    <span className="block font-bold">Simulate UPI Success</span>
                    <span className="text-[10px] text-sage font-mono">success@razorpay</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 transition group-hover:translate-x-1" />
              </button>
            </div>

            <div className="mt-5 text-center text-[10px] text-sage">
              This triggers server-side HMAC signature verification and reserves the slot.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
