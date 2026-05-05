import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, Trash2, ShoppingBag, Cookie } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { getProductImage } from '../lib/productImages';

export function Cart() {
  const { items, isOpen, closeCart, removeItem, updateQty, clearCart, totalItems, totalPrice } = useCartStore();
  const navigate = useNavigate();
  const count = totalItems();
  const total = totalPrice();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-ink/30 backdrop-blur-sm z-[60]"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.aside
            key="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-xl bg-bg border-l border-ink/10 z-[70] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-ink/10">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-accent" />
                <h2 className="font-serif text-2xl">Your Bag</h2>
                {count > 0 && (
                  <span className="bg-blush text-ink text-xs font-bold px-2.5 py-1 rounded-full">
                    {count}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {items.length > 0 && (
                  <button
                    onClick={() => { if (window.confirm('Remove all items from your cart?')) clearCart(); }}
                    className="text-ink/40 hover:text-ink text-xs font-mono uppercase tracking-widest transition-colors"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={closeCart}
                  className="p-2.5 rounded-full hover:bg-ink/10 text-ink/60 hover:text-ink transition-colors"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto custom-scrollbar py-6 px-8">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-5 text-ink/40">
                  <Cookie className="w-20 h-20 opacity-20" />
                  <p className="font-serif text-2xl">Your bag is empty</p>
                  <p className="font-mono text-xs uppercase tracking-widest">Add some cookies to get started</p>
                  <button
                    onClick={closeCart}
                    className="mt-4 px-8 py-3.5 bg-accent text-white font-mono text-xs uppercase tracking-widest font-bold rounded-full hover:bg-accent/80 transition-colors"
                  >
                    Shop Now
                  </button>
                </div>
              ) : (
                <ul className="flex flex-col gap-5">
                  <AnimatePresence initial={false}>
                    {items.map(({ product, quantity }) => (
                      <motion.li
                        key={product.id}
                        layout
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 60 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-5 bg-surface rounded-2xl p-4 border border-ink/5"
                      >
                        {/* Image */}
                        <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-ink/5">
                          <img
                            src={getProductImage(product)}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <p className="font-serif text-base leading-snug line-clamp-1">{product.name}</p>
                            <p className="font-mono text-sm text-accent font-bold mt-1">
                              ₹{product.price.toFixed(2)}
                            </p>
                          </div>

                          {/* Qty controls */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-3 bg-ink/5 rounded-full px-2 py-1">
                              <button
                                onClick={() => updateQty(product.id, quantity - 1)}
                                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-ink/10 transition-colors text-ink/60 hover:text-ink"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="font-mono text-sm font-bold w-5 text-center">{quantity}</span>
                              <button
                                onClick={() => updateQty(product.id, quantity + 1)}
                                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-ink/10 transition-colors text-ink/60 hover:text-ink"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(product.id)}
                              className="p-1.5 text-ink/30 hover:text-red-400 transition-colors rounded-full hover:bg-red-400/10"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-8 py-6 border-t border-ink/10 flex flex-col gap-4 bg-surface/50">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-widest text-ink/60">Subtotal</span>
                  <span className="font-serif text-3xl font-bold">₹{total.toFixed(2)}</span>
                </div>
                <p className="font-mono text-[10px] text-ink/40 uppercase tracking-widest -mt-2">
                  Shipping &amp; taxes calculated at checkout
                </p>
                <button
                  onClick={() => { closeCart(); navigate('/checkout'); }}
                  className="w-full py-4 bg-accent text-white font-mono text-xs font-bold uppercase tracking-widest rounded-full hover:bg-accent/90 active:scale-95 transition-all"
                >
                  Proceed to Checkout →
                </button>
                <button
                  onClick={closeCart}
                  className="w-full py-3 border border-ink/20 text-ink font-mono text-xs font-bold uppercase tracking-widest rounded-full hover:bg-ink/5 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
