import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Eye, EyeOff, Lock, Mail, User, Phone, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      await register(name, email, password, phone);
      showToast('Account created successfully! Welcome to CareSync.', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 bg-paper rounded-clinic-lg shadow-neumorph-lg border border-mint/60 overflow-hidden">
        {/* Left Mint Brand Panel */}
        <div className="md:col-span-5 bg-gradient-to-br from-mint via-mist to-mint/80 p-8 sm:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-mint">
          <div>
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-forest flex items-center justify-center text-white shadow-xs">
                <PlusCircle className="w-6 h-6 text-limeChip stroke-[2.5]" />
              </div>
              <span className="font-display font-extrabold text-2xl text-forest tracking-tight">
                CareSync
              </span>
            </div>

            <h2 className="text-2xl font-extrabold text-ink leading-tight mb-3">
              Join India's trusted telehealth network.
            </h2>
            <p className="text-xs sm:text-sm text-sage leading-relaxed">
              Create your profile to book instant video consults with Bengaluru's best doctors and access digital prescriptions anytime.
            </p>
          </div>

          <div className="p-4 bg-paper/90 rounded-2xl shadow-xs border border-white my-6">
            <div className="flex items-center gap-2 text-forest font-bold text-xs mb-1">
              <ShieldCheck className="w-4 h-4 text-leaf" />
              <span>Strict Patient Confidentiality</span>
            </div>
            <p className="text-[11px] text-sage">
              Your health questions and consultations are 100% private and protected by Indian digital health standards.
            </p>
          </div>

          <div className="text-[11px] text-sage">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-forest underline">
              Sign In here
            </Link>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-2xl font-extrabold text-ink">Create Account</h3>
            <p className="text-xs text-sage mt-1">
              Enter your details to register as a patient.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-alert/30 text-xs font-bold text-alert">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-ink mb-1 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tushan Kumar"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm bg-mist clinic-inset border-none focus:outline-none focus:ring-1 focus:ring-forest text-ink"
                />
                <User className="w-4 h-4 text-sage absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-ink mb-1 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl text-xs sm:text-sm bg-mist clinic-inset border-none focus:outline-none focus:ring-1 focus:ring-forest text-ink"
                  />
                  <Mail className="w-4 h-4 text-sage absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1 uppercase tracking-wider">
                  Mobile Phone
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl text-xs sm:text-sm bg-mist clinic-inset border-none focus:outline-none focus:ring-1 focus:ring-forest text-ink"
                  />
                  <Phone className="w-4 h-4 text-sage absolute left-3.5 top-3" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-ink mb-1 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm bg-mist clinic-inset border-none focus:outline-none focus:ring-1 focus:ring-forest text-ink"
                  />
                  <Lock className="w-4 h-4 text-sage absolute left-3.5 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-sage hover:text-ink absolute right-2.5 top-2"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl text-xs sm:text-sm bg-mist clinic-inset border-none focus:outline-none focus:ring-1 focus:ring-forest text-ink"
                  />
                  <Lock className="w-4 h-4 text-sage absolute left-3.5 top-3" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-full text-sm font-bold text-white bg-forest hover:bg-evergreen active:scale-95 shadow-neumorph transition disabled:opacity-50 mt-3"
            >
              {submitting ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;

