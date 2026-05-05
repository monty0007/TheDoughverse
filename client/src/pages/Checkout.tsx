import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingBag, MapPin, ArrowLeft, Check } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useFirebaseAuth } from '../store/useFirebaseAuth';
import { getWhatsAppNumber } from '../lib/settings';

const BLUE = '#1A4FE8';
const CREAM = '#FFFCDC';

export function Checkout() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useFirebaseAuth();
  const { items, totalPrice, clearCart } = useCartStore();
  const total = totalPrice();
  const [shipping, setShipping] = useState({ name: '', address: '', city: '', zip: '', phone: '' });
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: CREAM }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-3 border-[#1A4FE8]/20 border-t-[#1A4FE8] rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest font-bold" style={{ color: BLUE, opacity: 0.5, fontFamily: '"Nunito", sans-serif' }}>Loading...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  if (items.length === 0 && !success) return <Navigate to="/cookies" replace />;

  const canSubmit = shipping.name && shipping.address && shipping.city && shipping.zip && shipping.phone;

  const handleCheckout = () => {
    if (!canSubmit) return;
    setProcessing(true);

    const orderLines = items
      .map(({ product, quantity }) => `  • ${product.name} ×${quantity} — ₹${(product.price * quantity).toFixed(2)}`)
      .join('\n');

    const message = [
      '\uD83C\uDF6A *New Order — The Dough Affair*',
      '',
      '*Customer Details*',
      `Name: ${shipping.name}`,
      `Phone: ${shipping.phone}`,
      `Address: ${shipping.address}, ${shipping.city} — ${shipping.zip}`,
      '',
      '*Order*',
      orderLines,
      '',
      `*Total: ₹${total.toFixed(2)}*`,
    ].join('\n');

    const url = `https://wa.me/${getWhatsAppNumber()}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');

    clearCart();
    setProcessing(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-28 sm:pt-28 pb-20" style={{ backgroundColor: CREAM }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: '#2ECC71' }}
          >
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1
            className="text-4xl font-bold mb-3"
            style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
          >
            Order Sent!
          </h1>
          <p
            className="text-sm mb-8"
            style={{ color: BLUE, opacity: 0.55, fontFamily: '"Nunito", sans-serif' }}
          >
            Your order has been sent via WhatsApp. We’ll confirm it shortly!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate('/orders')}
              className="px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-white"
              style={{ backgroundColor: BLUE, fontFamily: '"Nunito", sans-serif' }}
            >
              View Orders
            </button>
            <button
              onClick={() => navigate('/cookies')}
              className="px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{ border: `1.5px solid ${BLUE}`, color: BLUE, fontFamily: '"Nunito", sans-serif' }}
            >
              Order More
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 sm:pt-28 pb-20 px-4" style={{ backgroundColor: CREAM }}>
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-8 mt-4 text-xs font-bold uppercase tracking-wider hover:opacity-70 transition-opacity"
          style={{ color: BLUE, fontFamily: '"Nunito", sans-serif' }}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h1
          className="text-4xl sm:text-5xl font-bold mb-10"
          style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
        >
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Shipping form — 3 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3 rounded-3xl p-8"
            style={{ backgroundColor: '#fff', border: '1px solid rgba(26,79,232,0.08)' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-5 h-5" style={{ color: BLUE }} />
              <h2
                className="text-lg font-bold"
                style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
              >
                Shipping Details
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              {[
                { key: 'name', label: 'Full Name', type: 'text' },
                { key: 'phone', label: 'Phone Number', type: 'tel' },
                { key: 'address', label: 'Street Address', type: 'text' },
                { key: 'city', label: 'City', type: 'text' },
                { key: 'zip', label: 'ZIP / Postal Code', type: 'text' },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label
                    className="block text-[10px] uppercase tracking-widest font-bold mb-2"
                    style={{ color: BLUE, opacity: 0.45, fontFamily: '"Nunito", sans-serif' }}
                  >
                    {label}
                  </label>
                  <input
                    type={type}
                    value={(shipping as any)[key]}
                    onChange={(e) => setShipping({ ...shipping, [key]: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2"
                    style={{
                      border: '1.5px solid rgba(26,79,232,0.12)',
                      color: BLUE,
                      fontFamily: '"Nunito", sans-serif',
                    }}
                  />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Order summary — 2 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 rounded-3xl p-8 h-fit"
            style={{ backgroundColor: '#fff', border: '1px solid rgba(26,79,232,0.08)' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <ShoppingBag className="w-5 h-5" style={{ color: BLUE }} />
              <h2
                className="text-lg font-bold"
                style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
              >
                Order Summary
              </h2>
            </div>

            <ul className="flex flex-col gap-3 mb-6">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex items-center gap-3">
                  <img src={product.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate" style={{ color: BLUE }}>{product.name}</p>
                    <p className="text-[10px]" style={{ color: BLUE, opacity: 0.45 }}>×{quantity}</p>
                  </div>
                  <span className="text-xs font-bold" style={{ color: BLUE }}>
                    ₹{(product.price * quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t pt-4 mb-6" style={{ borderColor: 'rgba(26,79,232,0.1)' }}>
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-widest font-bold" style={{ color: BLUE, opacity: 0.45 }}>Total</span>
                <span className="text-2xl font-bold" style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}>
                  ₹{total.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={!canSubmit || processing}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-full text-sm font-bold text-white transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-50"
              style={{ backgroundColor: BLUE, fontFamily: '"Nunito", sans-serif' }}
            >
              {processing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Send via WhatsApp
                </>
              )}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
