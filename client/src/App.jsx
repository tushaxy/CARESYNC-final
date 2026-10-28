import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AiOrb from './components/AiOrb';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorsDirectory from './pages/DoctorsDirectory';
import DoctorDetail from './pages/DoctorDetail';
import Booking from './pages/Booking';
import BookingSuccess from './pages/BookingSuccess';
import ConsultRoom from './pages/ConsultRoom';
import Prescription from './pages/Prescription';
import Pharmacy from './pages/Pharmacy';
import Cart from './pages/Cart';
import Dashboard from './pages/Dashboard';

export const App = () => {
  return (
    <div className="flex flex-col min-h-screen bg-mist text-ink">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/doctors" element={<DoctorsDirectory />} />
          <Route path="/doctors/:docId" element={<DoctorDetail />} />
          <Route
            path="/book/:docId"
            element={
              <ProtectedRoute>
                <Booking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking/success/:id"
            element={
              <ProtectedRoute>
                <BookingSuccess />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consult/:id"
            element={
              <ProtectedRoute>
                <ConsultRoom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prescriptions/:id"
            element={
              <ProtectedRoute>
                <Prescription />
              </ProtectedRoute>
            }
          />
          <Route path="/pharmacy" element={<Pharmacy />} />
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
      {/* Global AI Orb rendered on every route (Section 11 requirement) */}
      <AiOrb />
    </div>
  );
};

export default App;

