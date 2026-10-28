import React from 'react';
import { Pill, Activity, ShieldCheck, Plus, Minus, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatRupee } from '../lib/format';

export const ProductCard = ({ product, className = '' }) => {
  const { cartItems, addToCart, updateQty } = useCart();

  if (!product) return null;

  const cartEntry = cartItems.find((i) => i.sku === product.sku);
  const qty = cartEntry ? cartEntry.qty : 0;

  // Icon based on category
  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'device':
        return Activity;
      case 'wellness':
        return ShieldCheck;
      default:
        return Pill;
    }
  };

  const Icon = getCategoryIcon(product.category);

  return (
    <div
      className={`bg-paper rounded-clinic p-5 shadow-neumorph hover:shadow-neumorph-lg transition-all duration-200 flex flex-col justify-between border border-mint/40 ${className}`}
    >
      <div>
        {/* Mint Gradient Tile Holding Icon */}
        <div className="relative w-full h-36 rounded-2xl bg-gradient-to-br from-mint via-mist to-mint/70 flex items-center justify-center overflow-hidden mb-4 border border-white">
          <div className="w-16 h-16 rounded-2xl bg-white/80 shadow-sm flex items-center justify-center text-forest transform transition duration-300 group-hover:scale-105">
            <Icon className="w-8 h-8 text-forest" />
          </div>

          <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 text-forest shadow-xs">
            {product.category}
          </span>
        </div>

        {/* Brand & Title */}
        <span className="text-[11px] font-semibold text-leaf uppercase tracking-wider block">
          {product.brand || 'CareSync Pharmacy'}
        </span>
        <h3 className="text-sm font-bold text-ink mt-0.5 line-clamp-2 leading-snug" title={product.name}>
          {product.name}
        </h3>
        <p className="text-xs text-sage mt-1 line-clamp-2 leading-relaxed">
          {product.blurb}
        </p>
      </div>

      {/* Pricing & Cart Action */}
      <div className="mt-4 pt-3 border-t border-mint/50 flex items-center justify-between gap-2">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold text-forest tabular-nums">
              {formatRupee(product.price)}
            </span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-xs text-sage/70 line-through tabular-nums">
                {formatRupee(product.mrp)}
              </span>
            )}
          </div>
          <span className="text-[10px] text-leaf font-medium">In stock</span>
        </div>

        {/* Add / Stepper Pill */}
        {qty === 0 ? (
          <button
            onClick={() => addToCart(product, 1)}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-forest hover:bg-evergreen active:scale-95 shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 bg-mint px-2 py-1 rounded-full text-xs font-bold text-forest">
            <button
              onClick={() => updateQty(product.sku, qty - 1)}
              className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-forest hover:bg-white/80 transition"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-4 text-center tabular-nums">{qty}</span>
            <button
              onClick={() => updateQty(product.sku, qty + 1)}
              className="w-5 h-5 rounded-full bg-forest text-white flex items-center justify-center hover:bg-evergreen transition"
              aria-label="Increase quantity"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;

