import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, Stethoscope, ArrowUpDown } from 'lucide-react';
import api from '../lib/api';
import DoctorCard from '../components/DoctorCard';
import { DoctorCardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

export const DoctorsDirectory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSpecialty = searchParams.get('specialization') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialty);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('rating');
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  // Load specialty counts
  useEffect(() => {
    api
      .get('/doctors/meta')
      .then((res) => {
        setSpecialties(res.data.specialties || []);
      })
      .catch(() => {});
  }, []);

  // Geolocation for "Nearest Me" sort
  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    if (newSort === 'distance' && !userLocation) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            showToast('Location detected: sorting doctors by proximity', 'success');
          },
          (err) => {
            // Graceful fallback to central Bengaluru (12.9716, 77.5946)
            setUserLocation({ lat: 12.9716, lng: 77.5946 });
            showToast('Using Bengaluru Central as default location', 'info');
          }
        );
      } else {
        setUserLocation({ lat: 12.9716, lng: 77.5946 });
      }
    }
  };

  // Fetch doctors
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.append('search', searchTerm.trim());
    if (selectedSpecialty !== 'All') params.append('specialization', selectedSpecialty);
    params.append('sort', sortBy);
    if (userLocation) {
      params.append('lat', userLocation.lat);
      params.append('lng', userLocation.lng);
    }

    api
      .get(`/doctors?${params.toString()}`)
      .then((res) => {
        setDoctors(res.data.doctors || []);
      })
      .catch((err) => {
        console.error('Failed to load doctors:', err);
      })
      .finally(() => setLoading(false));
  }, [selectedSpecialty, searchTerm, sortBy, userLocation]);

  const topNineSpecialties = specialties.slice(0, 9);

  return (
    <div className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title & Search Header */}
      <div className="mb-8">
        <span className="text-xs font-extrabold uppercase tracking-widest text-leaf block mb-2">
          PRACTITIONER DIRECTORY
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink">
          Find Verified Doctors in Bengaluru
        </h1>
        <p className="text-sm text-sage mt-2">
          Consult experienced physicians across 25+ medical specialties with instant slot availability.
        </p>

        {/* Search Bar & Sort Dropdown */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search doctor by name, specialty (e.g. Dermatologist), or clinic area..."
              className="w-full pl-11 pr-4 py-3.5 rounded-full text-xs sm:text-sm bg-paper clinic-inset border border-mint/70 focus:outline-none focus:ring-2 focus:ring-forest text-ink placeholder:text-sage"
            />
            <Search className="w-5 h-5 text-sage absolute left-4 top-3.5" />
          </div>

          <div className="md:col-span-4 flex items-center gap-2">
            <div className="relative w-full">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full pl-10 pr-8 py-3.5 rounded-full text-xs sm:text-sm bg-paper border border-mint/70 text-ink font-semibold focus:outline-none focus:ring-2 focus:ring-forest appearance-none shadow-xs"
              >
                <option value="rating">Top Rated (Default)</option>
                <option value="fee">Fee: Low to High</option>
                <option value="distance">Nearest to Me (GPS)</option>
              </select>
              <ArrowUpDown className="w-4 h-4 text-forest absolute left-3.5 top-4 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Specialty Filter Chips (All + Top 9 with counts) */}
        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setSelectedSpecialty('All')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap shadow-xs ${
              selectedSpecialty === 'All'
                ? 'bg-forest text-white'
                : 'bg-paper text-sage hover:text-forest border border-mint/80'
            }`}
          >
            All Specialists ({specialties.reduce((acc, s) => acc + s.count, 0) || 25})
          </button>

          {topNineSpecialties.map((spec) => (
            <button
              key={spec.name}
              onClick={() => setSelectedSpecialty(spec.name)}
              className={`px-3.5 py-2 rounded-full text-xs font-bold transition whitespace-nowrap shadow-xs ${
                selectedSpecialty === spec.name
                  ? 'bg-forest text-white'
                  : 'bg-paper text-sage hover:text-forest border border-mint/80'
              }`}
            >
              {spec.name} <span className="opacity-70">({spec.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results Count Bar */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-mint/60 text-xs text-sage font-semibold">
        <span>
          Showing <strong className="text-forest tabular-nums">{doctors.length}</strong> verified doctors
        </span>
        {userLocation && sortBy === 'distance' && (
          <span className="flex items-center gap-1 text-leaf font-bold">
            <MapPin className="w-3.5 h-3.5" />
            <span>Proximity active</span>
          </span>
        )}
      </div>

      {/* Doctor Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <DoctorCardSkeleton key={i} />
          ))}
        </div>
      ) : doctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <DoctorCard key={doc.docId} doctor={doc} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No doctors match your criteria"
          description="Try broadening your search keywords or switching specialty to 'All'."
          action={
            <button
              onClick={() => {
                setSelectedSpecialty('All');
                setSearchTerm('');
              }}
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-forest text-white shadow-sm hover:bg-evergreen transition"
            >
              Reset Filters
            </button>
          }
        />
      )}
    </div>
  );
};

export default DoctorsDirectory;
