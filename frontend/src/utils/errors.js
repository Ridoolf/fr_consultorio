export function getErrorMessage(err, fallback = 'Ocurrió un error inesperado.') {
  const data = err?.response?.data;
  if (!data) return fallback;

  if (typeof data === 'string') return data;
  if (data.detail) return String(data.detail);

  const parts = [];
  Object.entries(data).forEach(([key, value]) => {
    const label = key === 'non_field_errors' ? '' : `${key}: `;
    if (Array.isArray(value)) {
      parts.push(`${label}${value.join(', ')}`);
    } else {
      parts.push(`${label}${value}`);
    }
  });
  return parts.length ? parts.join(' · ') : fallback;
}
