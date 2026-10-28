import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  Truck,
  ShieldCheck,
  MapPin,
  Check,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatRupee } from '../lib/format';
import api from '../lib/api';

export const Cart = () => {
  const { cartItems, updateQty, removeFromCart, clearCart, subtotal, deliveryFee, total } =
    useCart();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    line1: '',
    area: '',
    city: 'Bengaluru',
    pincode: '',
  });

  const [placingOrder, setPlacingOrder] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const handleInputChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      showToast('Please sign in to place an order', 'info');
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }

    if (!address.name || !address.phone || !address.line1 || !address.city || !address.pincode) {
      showToast('Please fill all required delivery address fields', 'error');
      return;
    }

    if (address.pincode.length < 6) {
      showToast('Please enter a valid 6-digit Indian PIN code', 'error');
      return;
    }

    setPlacingOrder(true);

    try {
      const res = await api.post('/orders', {
        items: cartItems,
        address,
      });

      const orderData = res.data?.order;
      setCompletedOrder(orderData);
      clearCart();
      showToast('Order placed successfully! Cash on delivery confirmed.', 'success');
    } catch (err) {
      console.error('Order placement error:', err);
      showToast(err.response?.data?.message || 'Could not place order', 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  // Order Success Panel View
  if (completedOrder) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="max-w-xl w-full bg-paper rounded-clinic p-8 sm:p-10 shadow-neumorph-lg border border-mint/60 text-center animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-mint text-forest flex items-center justify-center shadow-neumorph">
            <CheckCircle2 className="w-12 h-12 text-forest stroke-[2.5]" />
          </div>

          <span className="text-xs font-bold uppercase tracking-wider text-leaf block mb-1">
            ORDER CONFIRMED
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink">
            Thank you for your order!
          </h2>
          <p className="text-xs sm:text-sm text-sage mt-1">
            Order Reference ID:{' '}
            <strong className="text-forest font-mono">{completedOrder._id}</strong>
          </p>

          <div className="mt-6 p-4 rounded-2xl bg-mist border border-mint text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-sage">Total Items Ordered:</span>
              <strong className="text-ink">{completedOrder.items?.length} items</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-sage">Total Amount (COD):</span>
              <strong className="text-forest text-sm">{formatRupee(completedOrder.total)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-sage">Delivery Destination:</span>
              <span className="text-ink font-semibold">
                {completedOrder.address?.line1}, {completedOrder.address?.city} - {completedOrder.address?.pincode}
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              to="/dashboard"
              className="flex-1 py-3.5 rounded-full text-xs sm:text-sm font-bold text-white bg-forest hover:bg-evergreen transition shadow-sm"
            >
              Track in Dashboard
            </Link>
            <Link
              to="/pharmacy"
              className="py-3.5 px-6 rounded-full text-xs sm:text-sm font-bold text-forest bg-paper border border-mint hover:bg-mist transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Empty Cart View
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-paper rounded-clinic p-8 text-center shadow-neumorph border border-mint/40">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-mint flex items-center justify-center text-forest shadow-xs">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-ink mb-1">Your Cart is Empty</h2>
          <p className="text-xs sm:text-sm text-sage mb-6">
            Explore our catalog of medicines, wellness products, and digital monitors.
          </p>
          <Link
            to="/pharmacy"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-bold text-white bg-forest hover:bg-evergreen transition shadow-sm"
          >
            <span>Explore Pharmacy</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <span className="text-xs font-extrabold uppercase tracking-widest text-leaf block mb-1">
          CHECKOUT REVIEW
        </span>
        <h1 className="text-3xl font-extrabold text-ink">Pharmacy Shopping Cart</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Line Items */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-paper rounded-clinic p-6 shadow-neumorph border border-mint/50 divide-y divide-mint/50">
            {cartItems.map((item) => (
              <div key={item.sku} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-leaf">
                    {item.category || 'Pharmacy'}
                  </span>
                  <h3 className="text-sm font-bold text-ink truncate" title={item.name}>
                    {item.name}
                  </h3>
                  <p className="text-xs font-extrabold text-forest tabular-nums mt-0.5">
                    {formatRupee(item.price)} each
                  </p>
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center gap-2 bg-mint px-2.5 py-1 rounded-full text-xs font-bold text-forest">
                  <button
                    onClick={() => updateQty(item.sku, item.qty - 1)}
                    className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-forest hover:bg-white/80 transition"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-4 text-center tabular-nums">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.sku, item.qty + 1)}
                    className="w-5 h-5 rounded-full bg-forest text-white flex items-center justify-center hover:bg-evergreen transition"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {/* Line Total & Remove */}
                <div className="text-right">
                  <span className="text-sm font-extrabold text-ink block tabular-nums">
                    {formatRupee(item.price * item.qty)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.sku)}
                    className="text-sage hover:text-alert p-1 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery fee banner */}
          <div className="p-4 rounded-2xl bg-mint/50 border border-mint/80 flex items-center gap-3 text-xs text-forest">
            <Truck className="w-5 h-5 text-leaf flex-shrink-0" />
            <span>
              {subtotal >= 599 ? (
                <strong>Congratulations! Your order qualifies for FREE Express Delivery.</strong>
              ) : (
                <>Add items worth <strong>{formatRupee(599 - subtotal)}</strong> more for <strong>FREE Delivery</strong> (otherwise ₹49).</>
              )}
            </span>
          </div>
        </div>

        {/* Right Column: Address Form & Summary */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handlePlaceOrder} className="bg-paper rounded-clinic p-6 shadow-neumorph-lg border border-mint/60 space-y-4">
            <h3 className="text-base font-extrabold text-ink border-b border-mint/60 pb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-forest" />
              <span>Delivery Address</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-ink mb-1 uppercase">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={address.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Recipient Name"
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-mist clinic-inset border-none focus:outline-none focus:ring-1 focus:ring-forest text-ink"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-ink mb-1 uppercase">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={address.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-mist clinic-inset border-none focus:outline-none focus:ring-1 focus:ring-forest text-ink"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-ink mb-1 uppercase">Flat / House / Street *</label>
                <input
                  type="text"
                  name="line1"
                  value={address.line1}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Flat 301, Brigade Orchards"
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-mist clinic-inset border-none focus:outline-none focus:ring-1 focus:ring-forest text-ink"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-ink mb-1 uppercase">Locality / Area</label>
                  <input
                    type="text"
                    name="area"
                    value={address.area}
                    onChange={handleInputChange}
                    placeholder="e.g. Indiranagar"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-mist clinic-inset border-none focus:outline-none focus:ring-1 focus:ring-forest text-ink"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-ink mb-1 uppercase">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={address.city}
                    onChange={handleInputChange}
                    required
                    placeholder="Bengaluru"
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-mist clinic-inset border-none focus:outline-none focus:ring-1 focus:ring-forest text-ink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-ink mb-1 uppercase">PIN Code *</label>
                <input
                  type="text"
                  name="pincode"
                  maxLength="6"
                  value={address.pincode}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. 560038"
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-mist clinic-inset border-none focus:outline-none focus:ring-1 focus:ring-forest text-ink"
                />
              </div>
            </div>

            {/* Price Calculations */}
            <div className="pt-4 border-t border-mint space-y-2 text-xs">
              <div className="flex justify-between text-sage">
                <span>Items Subtotal</span>
                <span className="font-bold text-ink tabular-nums">{formatRupee(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sage">
                <span>Delivery Charges</span>
                <span className="font-bold tabular-nums">
                  {deliveryFee === 0 ? <span className="text-leaf">FREE</span> : formatRupee(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 text-sm font-extrabold text-forest border-t border-mint">
                <span>Grand Total</span>
                <span className="text-xl tabular-nums">{formatRupee(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={placingOrder}
              className="w-full py-3.5 rounded-full text-xs sm:text-sm font-bold text-white bg-forest hover:bg-evergreen active:scale-95 shadow-neumorph transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{placingOrder ? 'Confirming Dispatch...' : 'Place Order (Cash On Delivery)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center text-[10px] text-sage">
              Orders dispatched from CareSync Licensed Central Bengaluru Pharmacy Hub.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Cart;

