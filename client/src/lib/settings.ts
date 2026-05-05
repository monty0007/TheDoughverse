const KEY_WHATSAPP = 'dough_whatsapp_number';
const DEFAULT_WHATSAPP = '919999999999';

export function getWhatsAppNumber(): string {
  try {
    return localStorage.getItem(KEY_WHATSAPP) || DEFAULT_WHATSAPP;
  } catch {
    return DEFAULT_WHATSAPP;
  }
}

export function setWhatsAppNumber(number: string): void {
  try {
    localStorage.setItem(KEY_WHATSAPP, number.trim());
  } catch {}
}
