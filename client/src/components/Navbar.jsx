import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, Sparkles, LogOut, Calendar, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Find Doctors', path: '/doctors' },
    { label: 'Pharmacy', path: '/pharmacy' },
    { label: 'Appointments', path: isAuthenticated ? '/dashboard' : '/login' },
    { label: 'How It Works', path: '/#how-it-works' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-paper/95 backdrop-blur-md border-b border-mint/60 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="CareSync - AI Healthcare for a Brighter Tomorrow"
            className="h-11 sm:h-12 w-auto object-contain transition duration-200 group-hover:scale-105"
          />
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-limeChip text-forest border border-forest/10">
            AI SYNC
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              className={`px-3.5 py-2 rounded-full text-sm font-semibold transition ${
                isActive(link.path)
                  ? 'text-forest bg-mint font-bold'
                  : 'text-sage hover:text-forest hover:bg-mist'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Action Icons & Auth */}
        <div className="flex items-center gap-3">
          {/* Cart Icon */}
          <Link
            to="/cart"
            className="relative p-2.5 rounded-full bg-mist hover:bg-mint text-forest transition"
            aria-label="View Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 rounded-full bg-forest text-white text-[11px] font-bold flex items-center justify-center px-1 animate-pulse">
                {itemCount}
              </span>
            )}
          </Link>

          {/* User Auth state */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint text-forest text-xs sm:text-sm font-bold hover:bg-limeChip transition"
              >
                <div className="w-6 h-6 rounded-full bg-forest text-white flex items-center justify-center text-[10px] font-extrabold">
                  {user?.name?.[0] || 'U'}
                </div>
                <span className="hidden sm:inline truncate max-w-[100px]">
                  {user?.name?.split(' ')[0]}
                </span>
              </Link>
              <button
                onClick={logout}
                title="Log out"
                className="p-2 rounded-full hover:bg-mist text-sage hover:text-alert transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-full text-xs font-bold text-forest hover:bg-mist transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-full text-xs font-bold text-white bg-forest hover:bg-evergreen active:scale-95 shadow-sm transition"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-ink hover:bg-mist transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-paper border-b border-mint px-4 pt-2 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-ink hover:bg-mist transition"
            >
              {link.label}
            </Link>
          ))}

          {!isAuthenticated && (
            <div className="pt-3 border-t border-mint flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-full text-sm font-bold text-forest bg-mint"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-full text-sm font-bold text-white bg-forest"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;

