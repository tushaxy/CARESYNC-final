import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Shield, Lock, CreditCard, Video, AlertTriangle } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-evergreen text-mint/80 pt-16 pb-12 mt-20 border-t border-forest">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-forest/80">
          {/* Col 1: Brand & ABHA badge */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-leaf flex items-center justify-center text-evergreen shadow-sm">
                <PlusCircle className="w-5 h-5 text-white stroke-[2.5]" />
              </div>
              <span className="font-display font-extrabold text-2xl text-white tracking-tight">
                CareSync
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-forest text-limeChip border border-leaf/30">
                ABHA Compatible
              </span>
            </div>

            <p className="text-xs sm:text-sm text-mint/70 max-w-sm leading-relaxed">
              India's intelligent, patient-first telemedicine network. Bridging instant AI symptom triage, verified specialists across Bengaluru, WebRTC encrypted consults, and express door-to-door pharmacy.
            </p>

            <div className="flex items-center gap-2 text-xs text-limeChip font-semibold pt-1">
              <Shield className="w-4 h-4 text-leaf" />
              <span>Compliant with Telemedicine Practice Guidelines India</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/doctors" className="hover:text-white transition">
                  Find Doctors
                </Link>
              </li>
              <li>
                <Link to="/pharmacy" className="hover:text-white transition">
                  CareSync Pharmacy
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition">
                  My Appointments
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition">
                  Patient Portal Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Medical Specialties */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Specialties
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link to="/doctors?specialization=General+Physician" className="hover:text-white transition">
                  General Physicians
                </Link>
              </li>
              <li>
                <Link to="/doctors?specialization=Dermatologist" className="hover:text-white transition">
                  Dermatologists
                </Link>
              </li>
              <li>
                <Link to="/doctors?specialization=Pediatrician" className="hover:text-white transition">
                  Pediatricians
                </Link>
              </li>
              <li>
                <Link to="/doctors?specialization=Cardiologist" className="hover:text-white transition">
                  Cardiologists
                </Link>
              </li>
              <li>
                <Link to="/doctors?specialization=Psychiatrist" className="hover:text-white transition">
                  Psychiatrists
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Security & Protocols */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
              Security & Trust
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-mint/70">
              <li className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-leaf" />
                <span>256-bit AES Encrypted</span>
              </li>
              <li className="flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-leaf" />
                <span>PCI-DSS Razorpay Test</span>
              </li>
              <li className="flex items-center gap-2">
                <Video className="w-3.5 h-3.5 text-leaf" />
                <span>Private Jitsi WebRTC</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-leaf" />
                <span>ABHA & Ayushman Ready</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Section 12 Mandatory Medical Emergency Disclaimer */}
        <div className="mt-8 p-4 rounded-2xl bg-alert/15 border border-alert/30 text-xs sm:text-sm text-white flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-alert flex-shrink-0 animate-pulse" />
          <p className="leading-relaxed">
            <strong className="text-alert font-bold">Medical Emergency Disclaimer:</strong> CareSync provides onward direction and digital access. In a medical emergency, please call <span className="font-bold underline text-limeChip">112</span> or <span className="font-bold underline text-limeChip">108</span> immediately. AI advice is clinical guidance, not a medical diagnosis.
          </p>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-mint/60 gap-4">
          <p>© {new Date().getFullYear()} CareSync Health Technologies India Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-white cursor-pointer transition">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition">Terms of Service</span>
            <span className="hover:text-white cursor-pointer transition">Telemedicine Ethics</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

