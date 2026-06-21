export function getErrorMessage(err, fallback = 'Ocurrió un error inesperado.') {
  const status = err?.response?.status;
  const data = err?.response?.data;
  if (!data) return fallback;

  if (typeof data === 'string') {
    if (data.trim().startsWith('<!') || data.includes('<html')) {
      if (status === 404) {
        return 'El servidor no encontró el recurso. Verificá que el backend esté actualizado (deploy en Render) y que las migraciones estén aplicadas.';
      }
      return fallback;
    }
    return data;
  }
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
