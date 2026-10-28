import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Smartphone,
  Building2,
  Lock,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { formatRupee } from '../lib/format';

export const RazorpayModal = ({
  isOpen,
  onClose,
  amountInRupees,
  doctorName,
  user,
  appointmentId,
  orderId,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState('card'); // card, upi, netbanking
  const [cardNumber, setCardNumber] = useState('4111 1111 1111 1111');
  const [expiry, setExpiry] = useState('12/30');
  const [cvv, setCvv] = useState('123');
  const [cardName, setCardName] = useState(user?.name || 'Tushan Demo');
  const [upiId, setUpiId] = useState('success@razorpay');
  const [selectedBank, setSelectedBank] = useState('HDFC');

  const [step, setStep] = useState('details'); // details, otp, success
  const [otp, setOtp] = useState('1234');
  const [processing, setProcessing] = useState(false);

  // Handle Esc key to close
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePayClick = (e) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setStep('otp');
    }, 600);
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setStep('success');

      // Call onSuccess after success checkmark animation
      setTimeout(() => {
        const mockPaymentId = `pay_rzp_${Date.now()}`;
        onSuccess({
          razorpay_order_id: orderId || `order_${Date.now()}`,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: 'demo_signature_valid',
          appointment_id: appointmentId,
        });
      }, 1000);
    }, 800);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Razorpay Brand Header */}
        <div className="bg-[#0c2340] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Razorpay Blue Logo Symbol */}
            <div className="w-8 h-8 rounded-lg bg-[#0088cc] flex items-center justify-center shadow-md shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                <path d="M13.976 2L8 14.5h4.848L10.024 22 16 9.5h-4.848z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white !text-white" style={{ color: '#ffffff' }}>
                  CareSync Telemedicine
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  TEST MODE
                </span>
              </div>
              <p className="text-[11px] text-slate-200 !text-slate-200" style={{ color: '#e2e8f0' }}>
                Dr. {doctorName?.replace('Dr. ', '')} • {orderId || 'Direct Payment'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-300 !text-slate-300 uppercase tracking-wider block" style={{ color: '#cbd5e1' }}>
                Total Amount
              </span>
              <span className="text-xl font-extrabold text-emerald-400 tabular-nums">
                {formatRupee(amountInRupees)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition"
              aria-label="Cancel Razorpay checkout"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {step === 'details' && (
          <div className="grid grid-cols-1 sm:grid-cols-12 flex-1 overflow-y-auto">
            {/* Left Nav Tabs */}
            <div className="sm:col-span-4 bg-slate-50 border-r border-slate-200 p-3 flex flex-row sm:flex-col gap-1.5 overflow-x-auto sm:overflow-visible">
              <span className="hidden sm:block text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                Payment Options
              </span>

              <button
                type="button"
                onClick={() => setActiveTab('card')}
                className={`flex items-center justify-between w-full p-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'card'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200 font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CreditCard className={`w-4 h-4 ${activeTab === 'card' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>Card</span>
                </div>
                <ChevronRight className="hidden sm:block w-3 h-3 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('upi')}
                className={`flex items-center justify-between w-full p-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'upi'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200 font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Smartphone className={`w-4 h-4 ${activeTab === 'upi' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>UPI / QR</span>
                </div>
                <ChevronRight className="hidden sm:block w-3 h-3 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('netbanking')}
                className={`flex items-center justify-between w-full p-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'netbanking'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200 font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building2 className={`w-4 h-4 ${activeTab === 'netbanking' ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span>Netbanking</span>
                </div>
                <ChevronRight className="hidden sm:block w-3 h-3 text-slate-400" />
              </button>
            </div>

            {/* Right Tab Content */}
            <div className="sm:col-span-8 p-5 sm:p-6 flex flex-col justify-between">
              {activeTab === 'card' && (
                <form onSubmit={handlePayClick} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Enter Card Information</span>
                    <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                      Test Card 4111...
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Card Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        required
                        placeholder="4111 1111 1111 1111"
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-mono border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                      />
                      <CreditCard className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        required
                        placeholder="MM / YY"
                        className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        maxLength="4"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        required
                        placeholder="123"
                        className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm font-mono border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      required
                      placeholder="Name on card"
                      className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3.5 rounded-xl bg-[#0088cc] hover:bg-[#0077b3] active:scale-95 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4 text-sky-200" />
                    <span>Pay {formatRupee(amountInRupees)}</span>
                  </button>
                </form>
              )}

              {activeTab === 'upi' && (
                <form onSubmit={handlePayClick} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">UPI Instant Payment</span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                      UPI Test
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Virtual Payment Address (VPA)
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      required
                      placeholder="username@bank"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-mono border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                    <span className="font-bold block mb-1">Quick Select Test VPA:</span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => setUpiId('success@razorpay')}
                        className="px-2.5 py-1 rounded bg-white border border-slate-300 font-mono text-[11px] hover:border-emerald-500"
                      >
                        success@razorpay
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4 text-emerald-200" />
                    <span>Authorize {formatRupee(amountInRupees)}</span>
                  </button>
                </form>
              )}

              {activeTab === 'netbanking' && (
                <form onSubmit={handlePayClick} className="space-y-4">
                  <span className="text-xs font-bold text-slate-700 block">Select Netbanking Bank</span>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank'].map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`p-3 rounded-xl text-left border font-semibold transition ${
                          selectedBank === bank
                            ? 'border-blue-600 bg-blue-50 text-blue-900'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {bank}
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4 text-blue-200" />
                    <span>Proceed to {selectedBank}</span>
                  </button>
                </form>
              )}

              {/* Security watermark */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>256-bit SSL Encrypted</span>
                </div>
                <span>Secured by <strong>Razorpay</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Test OTP Simulation */}
        {step === 'otp' && (
          <div className="p-6 sm:p-8 text-center max-w-sm mx-auto">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              OTP
            </div>
            <h4 className="text-base font-extrabold text-slate-800">Bank 3D-Secure Verification</h4>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Enter test OTP sent to +91 98765••••• for transaction of {formatRupee(amountInRupees)}.
            </p>

            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <input
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="w-full text-center text-xl tracking-widest font-mono py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />

              <button
                type="submit"
                disabled={processing}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <span>{processing ? 'Verifying OTP...' : 'Submit OTP (Test)'}</span>
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Success Medallion */}
        {step === 'success' && (
          <div className="p-8 sm:p-12 text-center max-w-sm mx-auto animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 stroke-[2.5]" />
            </div>
            <h4 className="text-lg font-extrabold text-slate-900">Payment Successful!</h4>
            <p className="text-xs text-slate-500 mt-1">
              Razorpay transaction verified. Launching consultation room...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RazorpayModal;

