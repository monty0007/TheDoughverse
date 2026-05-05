import { motion, AnimatePresence } from 'motion/react';
import { Minus, Plus, Trash2, ShoppingBag, Cookie, ArrowLeft } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useNavigate, Link } from 'react-router-dom';

const BLUE = '#1A4FE8';
const CREAM = '#FFFCDC';

export function CartPage() {
  const { items, removeItem, updateQty, clearCart, totalItems, totalPrice } = useCartStore();
  const navigate = useNavigate();
  const count = totalItems();
  const total = totalPrice();

  return (
    <div className="min-h-screen pt-28 sm:pt-28 pb-20 px-4" style={{ backgroundColor: CREAM }}>
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-8 text-xs font-bold uppercase tracking-wider hover:opacity-70 transition-opacity"
          style={{ color: BLUE, fontFamily: '"Nunito", sans-serif' }}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Title */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <h1
              className="text-4xl sm:text-5xl font-bold"
              style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
            >
              Your Cart
            </h1>
            {count > 0 && (
              <span
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{ backgroundColor: '#E8B4D8', color: BLUE }}
              >
                {count} {count === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-bold uppercase tracking-wider hover:opacity-70 transition-opacity"
              style={{ color: BLUE, opacity: 0.45, fontFamily: '"Nunito", sans-serif' }}
            >
              Clear all
            </button>
          )}
        </div>

        {/* Empty state */}
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-5"
          >
            <Cookie className="w-24 h-24" style={{ color: BLUE, opacity: 0.15 }} />
            <p
              className="text-2xl font-bold"
              style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
            >
              Your cart is empty
            </p>
            <p
              className="text-xs uppercase tracking-widest"
              style={{ color: BLUE, opacity: 0.4, fontFamily: '"Nunito", sans-serif' }}
            >
              Add some cookies to get started
            </p>
            <Link
              to="/cookies"
              className="mt-4 px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider text-white transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: BLUE, fontFamily: '"Nunito", sans-serif' }}
            >
              Shop Cookies
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items list */}
            <div className="lg:col-span-2">
              <ul className="flex flex-col gap-4">
                <AnimatePresence initial={false}>
                  {items.map(({ product, quantity }) => (
                    <motion.li
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: -12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -60 }}
                      transition={{ duration: 0.2 }}
                      className="flex gap-3 sm:gap-5 rounded-2xl p-4 sm:p-5"
                      style={{ backgroundColor: '#fff', border: '1px solid rgba(26,79,232,0.08)' }}
                    >
                      {/* Image */}
                      <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <p
                            className="font-bold text-lg leading-snug"
                            style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
                          >
                            {product.name}
                          </p>
                          <p
                            className="text-xs mt-1 line-clamp-1"
                            style={{ color: BLUE, opacity: 0.45, fontFamily: '"Nunito", sans-serif' }}
                          >
                            {product.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          {/* Qty controls */}
                          <div
                            className="flex items-center gap-3 rounded-full px-3 py-1.5"
                            style={{ backgroundColor: 'rgba(26,79,232,0.06)' }}
                          >
                            <button
                              onClick={() => updateQty(product.id, quantity - 1)}
                              className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                              style={{ color: BLUE }}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span
                              className="font-bold text-sm w-5 text-center"
                              style={{ color: BLUE, fontFamily: '"Nunito", sans-serif' }}
                            >
                              {quantity}
                            </span>
                            <button
                              onClick={() => updateQty(product.id, quantity + 1)}
                              className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                              style={{ color: BLUE }}
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Price */}
                          <span
                            className="font-bold text-lg"
                            style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
                          >
                            ₹{(product.price * quantity).toFixed(0)}
                          </span>

                          {/* Remove */}
                          <button
                            onClick={() => removeItem(product.id)}
                            className="p-2 rounded-full transition-colors hover:bg-red-50"
                            style={{ color: 'rgba(26,79,232,0.3)' }}
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4 hover:text-red-400" />
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </div>

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1 rounded-2xl p-7 h-fit lg:sticky lg:top-32"
              style={{ backgroundColor: '#fff', border: '1px solid rgba(26,79,232,0.08)' }}
            >
              <div className="flex items-center gap-3 mb-6">
                <ShoppingBag className="w-5 h-5" style={{ color: BLUE }} />
                <h2
                  className="text-lg font-bold"
                  style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
                >
                  Summary
                </h2>
              </div>

              <div className="flex flex-col gap-3 mb-6">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between text-xs" style={{ color: BLUE }}>
                    <span style={{ opacity: 0.6, fontFamily: '"Nunito", sans-serif' }}>
                      {product.name} × {quantity}
                    </span>
                    <span className="font-bold">₹{(product.price * quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mb-6" style={{ borderColor: 'rgba(26,79,232,0.1)' }}>
                <div className="flex justify-between items-center">
                  <span
                    className="text-[10px] uppercase tracking-widest font-bold"
                    style={{ color: BLUE, opacity: 0.45, fontFamily: '"Nunito", sans-serif' }}
                  >
                    Total
                  </span>
                  <span
                    className="text-3xl font-bold"
                    style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
                  >
                    ₹{total.toFixed(0)}
                  </span>
                </div>
                <p
                  className="text-[10px] uppercase tracking-widest mt-1"
                  style={{ color: BLUE, opacity: 0.3, fontFamily: '"Nunito", sans-serif' }}
                >
                  Shipping calculated at checkout
                </p>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 rounded-full text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] min-h-[48px]"
                style={{ backgroundColor: BLUE, fontFamily: '"Nunito", sans-serif' }}
              >
                Proceed to Checkout →
              </button>

              <Link
                to="/cookies"
                className="block w-full text-center py-3 mt-3 rounded-full text-xs font-bold uppercase tracking-wider transition-colors hover:opacity-70 min-h-[44px] flex items-center justify-center"
                style={{ border: `1.5px solid rgba(26,79,232,0.15)`, color: BLUE, fontFamily: '"Nunito", sans-serif' }}
              >
                Continue Shopping
              </Link>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
