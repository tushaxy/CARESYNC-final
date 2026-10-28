import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { PlusCircle, Eye, EyeOff, Lock, Mail, ArrowRight, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const fillDemo = () => {
    setEmail('demo@caresync.in');
    setPassword('Demo@123');
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      await login(email, password);
      showToast('Logged in successfully! Welcome back.', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
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
              Your personal healthcare portal.
            </h2>
            <p className="text-xs sm:text-sm text-sage leading-relaxed">
              Access your verified consultation history, live video consult rooms, and instant e-prescriptions.
            </p>
          </div>

          {/* Floating mini feature cards */}
          <div className="space-y-3 my-8">
            <div className="p-3 bg-paper/90 rounded-2xl shadow-xs border border-white flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-forest flex-shrink-0" />
              <span className="text-xs font-bold text-ink">Personalized AI Health Guidance</span>
            </div>
            <div className="p-3 bg-paper/90 rounded-2xl shadow-xs border border-white flex items-center gap-3">
              <Shield className="w-4 h-4 text-forest flex-shrink-0" />
              <span className="text-xs font-bold text-ink">Encrypted Medical Records Vault</span>
            </div>
          </div>

          <div className="text-[11px] text-sage">
            Protected by 256-bit AES encryption & ABHA standards.
          </div>
        </div>

        {/* Right Form Card */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-2xl font-extrabold text-ink">Sign In</h3>
            <p className="text-xs text-sage mt-1">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-bold text-forest hover:underline">
                Create one now
              </Link>
            </p>
          </div>

          {/* Demo Hint Banner (Section 11 requirement) */}
          <div className="mb-6 p-3.5 rounded-2xl bg-mint/70 border border-mint flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-forest block">Demo Credentials:</span>
              <span className="text-sage font-mono">demo@caresync.in / Demo@123</span>
            </div>
            <button
              type="button"
              onClick={fillDemo}
              className="px-3 py-1 rounded-full bg-forest text-white text-xs font-bold hover:bg-evergreen transition shadow-xs"
            >
              Autofill
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-alert/30 text-xs font-bold text-alert">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-xs sm:text-sm bg-mist clinic-inset border-none focus:outline-none focus:ring-1 focus:ring-forest text-ink"
                />
                <Mail className="w-4 h-4 text-sage absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-xs sm:text-sm bg-mist clinic-inset border-none focus:outline-none focus:ring-1 focus:ring-forest text-ink"
                />
                <Lock className="w-4 h-4 text-sage absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-sage hover:text-ink absolute right-3 top-2.5"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-full text-sm font-bold text-white bg-forest hover:bg-evergreen active:scale-95 shadow-neumorph transition disabled:opacity-50 mt-2"
            >
              {submitting ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
