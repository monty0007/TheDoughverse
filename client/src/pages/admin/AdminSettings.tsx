import { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { MessageCircle, Save, Check } from 'lucide-react';
import { getWhatsAppLocalNumber, setWhatsAppNumber } from '../../lib/settings';

const BLUE = '#1A4FE8';
const CREAM = '#F5F0D8';

export function AdminSettings() {
  const [number, setNumber] = useState(() => getWhatsAppLocalNumber());
  const [saved, setSaved] = useState(true); // starts as saved (showing current stored value)
  const [error, setError] = useState(false);

  const handleChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 10);
    setNumber(digits);
    setSaved(false);
    setError(false);
  };

  const handleSave = () => {
    const digits = number.replace(/\D/g, '');
    if (digits.length !== 10) { setError(true); return; }
    setWhatsAppNumber(digits);
    setNumber(digits);
    setSaved(true);
    setError(false);
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-10 max-w-xl">
        <h1
          className="text-3xl font-bold mb-1"
          style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
        >
          Settings
        </h1>
        <p
          className="text-xs uppercase tracking-widest mb-10"
          style={{ color: BLUE, opacity: 0.4, fontFamily: '"Nunito", sans-serif' }}
        >
          App-wide configuration
        </p>

        {/* WhatsApp Number */}
        <div
          className="rounded-3xl p-8"
          style={{ backgroundColor: '#fff', border: '1px solid rgba(26,79,232,0.08)' }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: '#25D366' }}
            >
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2
                className="text-base font-bold leading-none"
                style={{ color: BLUE, fontFamily: '"Fredoka One", cursive' }}
              >
                WhatsApp Order Number
              </h2>
              <p
                className="text-[10px] uppercase tracking-widest mt-0.5"
                style={{ color: BLUE, opacity: 0.4, fontFamily: '"Nunito", sans-serif' }}
              >
                Customer orders are sent to this number
              </p>
            </div>
          </div>

          <label
            className="block text-[10px] uppercase tracking-widest font-bold mb-2"
            style={{ color: BLUE, opacity: 0.45, fontFamily: '"Nunito", sans-serif' }}
          >
            Phone number
          </label>
          <div className="flex gap-3">
            {/* Fixed +91 prefix */}
            <div
              className="flex items-center px-4 py-3 rounded-xl text-sm font-bold select-none shrink-0"
              style={{ border: '1.5px solid rgba(26,79,232,0.15)', color: BLUE, fontFamily: '"Nunito", sans-serif', backgroundColor: 'rgba(26,79,232,0.04)' }}
            >
              +91
            </div>
            <input
              type="tel"
              value={number}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="9876543210"
              maxLength={10}
              className="flex-1 px-4 py-3 rounded-xl text-sm outline-none focus:ring-2"
              style={{
                border: `1.5px solid ${error ? '#EF4444' : 'rgba(26,79,232,0.15)'}`,
                color: BLUE,
                fontFamily: '"Nunito", sans-serif',
              }}
            />
            <button
              onClick={handleSave}
              disabled={saved}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-all active:scale-95 disabled:opacity-60"
              style={{ backgroundColor: saved ? '#2ECC71' : BLUE, fontFamily: '"Nunito", sans-serif' }}
            >
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Saved' : 'Save'}
            </button>
          </div>
          {error && (
            <p className="text-[11px] mt-2 font-bold" style={{ color: '#EF4444', fontFamily: '"Nunito", sans-serif' }}>
              Wrong number — must be exactly 10 digits.
            </p>
          )}
          {!error && (
          <p
            className="text-[11px] mt-3"
            style={{ color: BLUE, opacity: 0.4, fontFamily: '"Nunito", sans-serif' }}
          >
            Enter the 10-digit number. <span className="font-bold">+91</span> is added automatically.
          </p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
