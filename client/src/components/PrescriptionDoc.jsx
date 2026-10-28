import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, ShoppingBag, PlusCircle, CheckCircle2, Calendar, User, Stethoscope } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../lib/format';

export const PrescriptionDoc = ({ prescription, doctor, user }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handlePrint = () => {
    window.print();
  };

  const handleOrderItems = () => {
    if (!prescription?.medicines?.length) return;

    let addedCount = 0;
    prescription.medicines.forEach((med) => {
      // Create a cart item from the prescription medicine
      // Derive SKU or mock SKU
      const sku = med.name.includes('Cetirizine')
        ? 'MED-02'
        : med.name.includes('Calamine')
        ? 'MED-07'
        : med.name.includes('Dolo')
        ? 'MED-01'
        : med.name.includes('ORS')
        ? 'MED-03'
        : `MED-RX-${Math.floor(Math.random() * 100)}`;

      const price = med.name.includes('Cetirizine')
        ? 29
        : med.name.includes('Calamine')
        ? 92
        : med.name.includes('Dolo')
        ? 34
        : 110;

      addToCart(
        {
          sku,
          name: med.name,
          price,
          mrp: price + 15,
          category: 'otc',
        },
        1
      );
      addedCount++;
    });

    showToast(`Added ${addedCount} prescribed items to your pharmacy cart!`, 'success');
    navigate('/cart');
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Top action bar (hidden in print) */}
      <div className="print:hidden flex items-center justify-between mb-6">
        <span className="text-xs font-semibold text-sage">
          Official Digital Telehealth e-Prescription
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-forest bg-mint hover:bg-limeChip transition shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>

          <button
            onClick={handleOrderItems}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold text-white bg-forest hover:bg-evergreen active:scale-95 transition shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Order These Items</span>
          </button>
        </div>
      </div>

      {/* The Printable Medical Sheet */}
      <div className="bg-paper rounded-clinic p-8 sm:p-12 shadow-neumorph-lg border border-mint/60 print:shadow-none print:border-none print:p-0">
        {/* Letterhead */}
        <div className="flex items-start justify-between border-b-2 border-forest/20 pb-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-forest flex items-center justify-center text-white shadow-xs">
              <PlusCircle className="w-7 h-7 text-limeChip stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-2xl text-forest tracking-tight">
                CareSync Healthcare
              </h1>
              <p className="text-xs text-sage font-medium">
                National Telemedicine & Digital Health Network
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-mint text-forest mb-1">
              E-Prescription
            </span>
            <p className="text-xs text-sage tabular-nums">
              Date: {formatDate(prescription.issuedAt)}
            </p>
            <p className="text-[10px] text-sage/70 font-mono">
              ID: {prescription._id}
            </p>
          </div>
        </div>

        {/* Doctor and Patient Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 rounded-2xl bg-mist/60 border border-mint/40 mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-leaf mb-1">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Prescribing Practitioner</span>
            </div>
            <h3 className="text-base font-bold text-ink">
              {doctor?.name || prescription.doctorId}
            </h3>
            <p className="text-xs font-medium text-forest">
              {doctor?.specialization || 'Consultant Physician'}
            </p>
            <p className="text-xs text-sage">
              {doctor?.qualifications || 'MBBS'} • Reg: KMC-73829-IND
            </p>
            <p className="text-xs text-sage">
              {doctor?.clinicArea || 'Bengaluru, Karnataka'}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-leaf mb-1">
              <User className="w-3.5 h-3.5" />
              <span>Patient Details</span>
            </div>
            <h3 className="text-base font-bold text-ink">
              {user?.name || 'Verified Patient'}
            </h3>
            <p className="text-xs text-sage">
              Email: {user?.email || 'patient@caresync.in'}
            </p>
            <p className="text-xs text-sage">
              Phone: {user?.phone || '+91 98765 43210'}
            </p>
            <p className="text-xs text-sage">
              Consultation Mode: Video (WebRTC Encrypted)
            </p>
          </div>
        </div>

        {/* Rx Symbol & Medication Table */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-serif italic font-extrabold text-3xl text-forest">
              ℞
            </span>
            <h4 className="text-sm font-bold uppercase tracking-wider text-ink">
              Prescribed Medications
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-mint text-sage uppercase text-[11px] font-bold">
                  <th className="py-2.5 px-3">Medicine & Strength</th>
                  <th className="py-2.5 px-3">Dosage</th>
                  <th className="py-2.5 px-3">Frequency</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Special Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mint/40 font-medium">
                {prescription.medicines?.map((med, idx) => (
                  <tr key={idx} className="hover:bg-mist/40 transition">
                    <td className="py-3 px-3 font-bold text-ink">
                      {med.name}
                    </td>
                    <td className="py-3 px-3 text-forest font-semibold">
                      {med.dosage}
                    </td>
                    <td className="py-3 px-3 text-ink">
                      {med.frequency}
                    </td>
                    <td className="py-3 px-3 text-sage">
                      {med.duration}
                    </td>
                    <td className="py-3 px-3 text-sage text-xs">
                      {med.notes || 'As indicated'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Clinical Advice & Follow-Up */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-mint/60">
          <div className="sm:col-span-2 space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-ink">
              Doctor's Advice & Lifestyle Guidance
            </h5>
            <ul className="space-y-1.5 text-xs text-sage">
              {prescription.advice?.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-leaf flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col justify-between p-4 rounded-xl bg-mint/50 border border-mint">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-forest block mb-1">
                Follow-up Review
              </span>
              <p className="text-xs text-ink font-semibold">
                In {prescription.followUpDays || 7} days or SOS if symptoms worsen.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-mint text-[11px] text-sage">
              Digital Signature Verified
              <span className="block font-bold text-forest">Dr. {doctor?.name?.replace('Dr. ', '') || 'Ananya Iyer'}</span>
            </div>
          </div>
        </div>

        {/* Disclaimer footer */}
        <div className="mt-8 pt-4 border-t border-mint/40 text-[11px] text-sage/80 text-center">
          <p>
            Demo prescription issued via CareSync consultation. Generated pursuant to the Indian Telemedicine Practice Guidelines 2020. Valid for online pharmacy fulfillment within India.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionDoc;
