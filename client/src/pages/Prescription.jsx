import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import PrescriptionDoc from '../components/PrescriptionDoc';
import Skeleton from '../components/Skeleton';
import { useToast } from '../context/ToastContext';

export const Prescription = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/prescriptions/${id}`)
      .then((res) => {
        setPrescription(res.data?.prescription);
      })
      .catch((err) => {
        console.error('Error fetching prescription:', err);
        showToast('Prescription could not be loaded', 'error');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 space-y-4">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-clinic" />
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-ink">Prescription Not Found</h2>
        <p className="text-xs text-sage mt-1">This prescription does not exist or has expired.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-6 py-2.5 rounded-full bg-forest text-white text-xs font-bold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6">
      <PrescriptionDoc
        prescription={prescription}
        doctor={prescription.doctor}
        user={prescription.appointment?.userId || null}
      />
    </div>
  );
};

export default Prescription;
