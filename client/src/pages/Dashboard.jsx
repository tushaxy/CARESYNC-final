import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  FileText,
  Package,
  History,
  LogOut,
  Video,
  CreditCard,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatRupee, formatDate, formatTime } from '../lib/format';
import Skeleton from '../components/Skeleton';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('appointments'); // appointments, prescriptions, orders, aiHistory
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [aiHistory, setAiHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/appointments/mine').catch(() => ({ data: { appointments: [] } })),
      api.get('/prescriptions/mine').catch(() => ({ data: { prescriptions: [] } })),
      api.get('/orders/mine').catch(() => ({ data: { orders: [] } })),
      api.get('/ai/history').catch(() => ({ data: { history: [] } })),
    ])
      .then(([appRes, rxRes, ordRes, aiRes]) => {
        setAppointments(appRes.data?.appointments || []);
        setPrescriptions(rxRes.data?.prescriptions || []);
        setOrders(ordRes.data?.orders || []);
        setAiHistory(aiRes.data?.history || []);
      })
      .catch((err) => {
        console.error('Error fetching dashboard data:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    showToast('Signed out successfully', 'info');
    navigate('/');
  };

  // Pipeline status helper
  const getStatusStep = (status, hasRx) => {
    if (hasRx || status === 'completed') return 4;
    if (status === 'paid') return 2;
    return 1; // booked/pending
  };

  // Order status pipeline steps
  const orderSteps = ['placed', 'packed', 'shipped', 'delivered'];

  return (
    <div className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Profile Header Block (Section 11 requirement) */}
      <div className="bg-paper rounded-clinic p-6 sm:p-8 shadow-neumorph border border-mint/50 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-forest text-white font-extrabold text-2xl flex items-center justify-center shadow-sm">
            {user?.name?.[0] || 'P'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-ink">{user?.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-limeChip text-forest">
                VERIFIED PATIENT
              </span>
            </div>
            <p className="text-xs text-sage mt-0.5">{user?.email} • {user?.phone || '+91 98765 43210'}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-alert bg-red-50 hover:bg-red-100 transition border border-alert/20"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Four Dashboard Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-mint/60 no-scrollbar">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs sm:text-sm font-bold transition whitespace-nowrap shadow-xs ${
            activeTab === 'appointments'
              ? 'bg-forest text-white'
              : 'bg-paper text-sage hover:text-forest border border-mint/80'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Appointments ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs sm:text-sm font-bold transition whitespace-nowrap shadow-xs ${
            activeTab === 'prescriptions'
              ? 'bg-forest text-white'
              : 'bg-paper text-sage hover:text-forest border border-mint/80'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Prescriptions ({prescriptions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs sm:text-sm font-bold transition whitespace-nowrap shadow-xs ${
            activeTab === 'orders'
              ? 'bg-forest text-white'
              : 'bg-paper text-sage hover:text-forest border border-mint/80'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('aiHistory')}
          className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs sm:text-sm font-bold transition whitespace-nowrap shadow-xs ${
            activeTab === 'aiHistory'
              ? 'bg-forest text-white'
              : 'bg-paper text-sage hover:text-forest border border-mint/80'
          }`}
        >
          <History className="w-4 h-4" />
          <span>AI Triage History ({aiHistory.length})</span>
        </button>
      </div>

      {/* Tab 1: Appointments with Status Pipeline */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="bg-paper rounded-clinic p-10 text-center shadow-neumorph text-sage text-sm">
              No appointments scheduled yet.{' '}
              <Link to="/doctors" className="font-bold text-forest underline ml-1">
                Book a consultation now.
              </Link>
            </div>
          ) : (
            appointments.map((appt) => {
              const currentStep = getStatusStep(appt.status, !!appt.prescriptionId);

              return (
                <div
                  key={appt._id}
                  className="bg-paper rounded-clinic p-6 shadow-neumorph border border-mint/50 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-leaf tracking-wider block">
                        {appt.mode === 'video' ? 'Video Consultation' : 'In-Clinic Appointment'}
                      </span>
                      <h3 className="text-lg font-bold text-ink">
                        {appt.doctor?.name || `Doctor ID: ${appt.doctorId}`}
                      </h3>
                      <p className="text-xs text-sage">
                        {appt.doctor?.specialization} • {formatDate(appt.slotISO)} at{' '}
                        {formatTime(appt.slotISO)}
                      </p>
                    </div>

                    {/* Contextual Actions (Section 11 requirement) */}
                    <div className="flex items-center gap-2">
                      {appt.status === 'pending' && (
                        <Link
                          to={`/book/${appt.doctorId}`}
                          state={{ slotISO: appt.slotISO, mode: appt.mode }}
                          className="px-4 py-2 rounded-full text-xs font-bold text-white bg-forest hover:bg-evergreen transition flex items-center gap-1.5 shadow-sm"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Pay Now ({formatRupee(appt.fee)})</span>
                        </Link>
                      )}

                      {appt.status === 'paid' && (
                        <Link
                          to={`/consult/${appt._id}`}
                          className="px-4 py-2 rounded-full text-xs font-bold text-white bg-leaf hover:bg-forest transition flex items-center gap-1.5 shadow-sm"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Consultation</span>
                        </Link>
                      )}

                      {appt.prescriptionId && (
                        <Link
                          to={`/prescriptions/${appt.prescriptionId}`}
                          className="px-4 py-2 rounded-full text-xs font-bold text-forest bg-mint hover:bg-limeChip transition flex items-center gap-1.5 border border-mint"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Prescription</span>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Status Pipeline: Booked -> Paid -> Consulted -> Prescription ready */}
                  <div className="pt-3 border-t border-mint/50">
                    <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-bold">
                      <div className={`p-2 rounded-xl ${currentStep >= 1 ? 'bg-mint text-forest' : 'bg-mist text-sage/40'}`}>
                        1. Booked
                      </div>
                      <div className={`p-2 rounded-xl ${currentStep >= 2 ? 'bg-mint text-forest' : 'bg-mist text-sage/40'}`}>
                        2. Paid
                      </div>
                      <div className={`p-2 rounded-xl ${currentStep >= 3 ? 'bg-mint text-forest' : 'bg-mist text-sage/40'}`}>
                        3. Consulted
                      </div>
                      <div className={`p-2 rounded-xl ${currentStep >= 4 ? 'bg-limeChip text-forest' : 'bg-mist text-sage/40'}`}>
                        4. Rx Ready
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Prescriptions List */}
      {activeTab === 'prescriptions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prescriptions.length === 0 ? (
            <div className="col-span-2 bg-paper rounded-clinic p-10 text-center shadow-neumorph text-sage text-sm">
              No prescriptions issued yet. Consult a doctor to receive digital prescriptions.
            </div>
          ) : (
            prescriptions.map((rx) => (
              <div
                key={rx._id}
                className="bg-paper rounded-clinic p-6 shadow-neumorph border border-mint/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-mint text-forest text-[10px] font-extrabold uppercase">
                      Digital Rx
                    </span>
                    <span className="text-xs text-sage tabular-nums">{formatDate(rx.issuedAt)}</span>
                  </div>
                  <h3 className="text-base font-bold text-ink">
                    Prescribed by Dr. {rx.doctor?.name?.replace('Dr. ', '') || rx.doctorId}
                  </h3>
                  <p className="text-xs text-sage mt-0.5">
                    {rx.medicines?.length} medications • Follow-up in {rx.followUpDays} days
                  </p>

                  <div className="mt-3 p-3 rounded-xl bg-mist border border-mint/40 text-xs">
                    <span className="font-bold text-forest block mb-1">Medicines:</span>
                    <ul className="list-disc list-inside text-sage space-y-0.5">
                      {rx.medicines?.map((m, i) => (
                        <li key={i} className="truncate">
                          {m.name} ({m.dosage})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-mint flex items-center justify-between">
                  <Link
                    to={`/prescriptions/${rx._id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-forest hover:underline"
                  >
                    <span>Open Printable Sheet</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  <span className="text-[11px] text-sage font-mono">ID: {rx._id.substring(0, 8)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Orders Tracker with 4-Step Status Pipeline */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-paper rounded-clinic p-10 text-center shadow-neumorph text-sage text-sm">
              No orders placed yet.{' '}
              <Link to="/pharmacy" className="font-bold text-forest underline ml-1">
                Browse CareSync Pharmacy.
              </Link>
            </div>
          ) : (
            orders.map((ord) => {
              const currentStepIdx = orderSteps.indexOf(ord.status);

              return (
                <div
                  key={ord._id}
                  className="bg-paper rounded-clinic p-6 shadow-neumorph border border-mint/50 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-mint/60 pb-3">
                    <div>
                      <span className="text-xs text-sage">Order #{ord._id}</span>
                      <h4 className="text-sm font-bold text-ink">
                        {ord.items?.length} Items • Total: {formatRupee(ord.total)} (Cash On Delivery)
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-leaf capitalize">
                      Status: {ord.status}
                    </span>
                  </div>

                  {/* 4-Step Tracker */}
                  <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-bold">
                    {orderSteps.map((step, idx) => {
                      const isComplete = idx <= currentStepIdx;
                      return (
                        <div
                          key={step}
                          className={`p-2.5 rounded-xl capitalize ${
                            isComplete ? 'bg-mint text-forest' : 'bg-mist text-sage/40'
                          }`}
                        >
                          {step}
                        </div>
                      );
                    })}
                  </div>

                  {/* Delivery Address summary */}
                  <div className="text-xs text-sage pt-1">
                    Delivering to:{' '}
                    <strong className="text-ink">
                      {ord.address?.name}, {ord.address?.line1}, {ord.address?.city} -{' '}
                      {ord.address?.pincode}
                    </strong>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 4: AI Triage History */}
      {activeTab === 'aiHistory' && (
        <div className="space-y-4">
          {aiHistory.length === 0 ? (
            <div className="bg-paper rounded-clinic p-10 text-center shadow-neumorph text-sage text-sm">
              No past symptom triage queries found. Use the floating AI Orb at bottom right to get started!
            </div>
          ) : (
            aiHistory.map((sess) => (
              <div
                key={sess._id}
                className="bg-paper rounded-clinic p-6 shadow-neumorph border border-mint/50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint text-forest text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{sess.triage?.specialty || 'General Care'}</span>
                  </span>
                  <span className="text-xs text-sage tabular-nums">
                    {formatDate(sess.createdAt)}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {sess.messages?.map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl ${
                        m.role === 'user' ? 'bg-mist text-ink font-semibold' : 'bg-mint/40 text-forest'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold text-sage block mb-0.5">
                        {m.role === 'user' ? 'You' : 'CareSync AI'}
                      </span>
                      <p>{m.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
