import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Pill, Sparkles } from 'lucide-react';
import api from '../lib/api';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export const Pharmacy = () => {
  const [medicines, setMedicines] = useState([]);
  const [category, setCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const { itemCount } = useCart();

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.append('search', searchTerm.trim());
    if (category !== 'All') params.append('category', category.toLowerCase());

    api
      .get(`/medicines?${params.toString()}`)
      .then((res) => {
        setMedicines(res.data?.medicines || []);
      })
      .catch((err) => {
        console.error('Error fetching pharmacy catalog:', err);
      })
      .finally(() => setLoading(false));
  }, [category, searchTerm]);

  const categories = ['All', 'OTC', 'Device', 'Wellness'];

  return (
    <div className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Banner & Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-leaf block mb-2">
            ONLINE CARE DISPENSARY
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink">
            CareSync Pharmacy & Devices
          </h1>
          <p className="text-sm text-sage mt-2">
            24 genuine OTC healthcare essentials, digital monitoring equipment, and wellness items with doorstep delivery.
          </p>
        </div>

        {itemCount > 0 && (
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-forest text-white text-xs font-bold shadow-sm hover:bg-evergreen transition self-start md:self-auto"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>View Cart ({itemCount} items)</span>
          </Link>
        )}
      </div>

      {/* Search Bar & Category Chips */}
      <div className="mb-8 space-y-4">
        <div className="relative max-w-2xl">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by product name, brand, or condition (e.g. fever, BP, calamine)..."
            className="w-full pl-11 pr-4 py-3.5 rounded-full text-xs sm:text-sm bg-paper clinic-inset border border-mint/70 focus:outline-none focus:ring-2 focus:ring-forest text-ink placeholder:text-sage"
          />
          <Search className="w-5 h-5 text-sage absolute left-4 top-3.5" />
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap shadow-xs ${
                category === cat
                  ? 'bg-forest text-white'
                  : 'bg-paper text-sage hover:text-forest border border-mint/80'
              }`}
            >
              {cat === 'All' ? 'All 24 Products' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : medicines.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {medicines.map((product) => (
            <ProductCard key={product.sku} product={product} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No products match your search"
          description="Try searching for another symptom keyword or switch category to 'All'."
          action={
            <button
              onClick={() => {
                setCategory('All');
                setSearchTerm('');
              }}
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-forest text-white shadow-sm hover:bg-evergreen transition"
            >
              Reset Search
            </button>
          }
        />
      )}
    </div>
  );
};

export default Pharmacy;
