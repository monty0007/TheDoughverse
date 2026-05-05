const KEY_WHATSAPP = 'dough_whatsapp_number';
const DEFAULT_LOCAL = '9971094410'; // 10-digit local number, +91 always prepended

/** Returns the full WhatsApp number with 91 prefix (e.g. "919876543210") */
export function getWhatsAppNumber(): string {
  try {
    const stored = localStorage.getItem(KEY_WHATSAPP) || DEFAULT_LOCAL;
    // Strip leading 91 if admin previously saved full number, then re-prepend
    const local = stored.startsWith('91') && stored.length > 10 ? stored.slice(2) : stored;
    return '91' + local;
  } catch {
    return '91' + DEFAULT_LOCAL;
  }
}

/** Stores only the local digits (without country code) */
export function setWhatsAppNumber(number: string): void {
  try {
    // Strip any leading +91 / 91 the admin may have typed
    let local = number.replace(/\D/g, '');
    if (local.startsWith('91') && local.length > 10) local = local.slice(2);
    localStorage.setItem(KEY_WHATSAPP, local);
  } catch {}
}

/** Returns only the local digits for display in the admin UI */
export function getWhatsAppLocalNumber(): string {
  try {
    const stored = localStorage.getItem(KEY_WHATSAPP) || DEFAULT_LOCAL;
    const local = stored.startsWith('91') && stored.length > 10 ? stored.slice(2) : stored;
    return local;
  } catch {
    return DEFAULT_LOCAL;
  }
}
