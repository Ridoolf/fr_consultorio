/** Normaliza entrada a HH:mm (24 h). Acepta "17:30", "1730", "930". Retorna null si inválida. */
export function normalizarHora(input) {
  const raw = String(input ?? '').trim();
  if (!raw) return '';

  if (/^\d{1,2}:\d{1,2}$/.test(raw)) {
    const [hStr, mStr] = raw.split(':');
    const h = Number(hStr);
    const m = Number(mStr);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
    return null;
  }

  const digits = raw.replace(/\D/g, '');
  if (digits.length === 4) {
    const h = Number(digits.slice(0, 2));
    const m = Number(digits.slice(2));
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
    return null;
  }

  if (digits.length === 3) {
    const h = Number(digits.slice(0, 1));
    const m = Number(digits.slice(1));
    if (h >= 0 && h <= 9 && m >= 0 && m <= 59) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
    return null;
  }

  if (digits.length === 2) {
    const h = Number(digits);
    if (h >= 0 && h <= 23) {
      return `${String(h).padStart(2, '0')}:00`;
    }
    return null;
  }

  return null;
}

export function esHoraValida(input) {
  return normalizarHora(input) !== null && normalizarHora(input) !== '';
}
