export function formatoFechaLocal(fecha) {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function hoyLocal() {
  return formatoFechaLocal(new Date());
}

export function formatoFechaLindo(yyyymmdd) {
  const [year, month, day] = yyyymmdd.split('-').map(Number);
  const fecha = new Date(year, month - 1, day);
  return fecha.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function sumarDias(yyyymmdd, delta) {
  const [year, month, day] = yyyymmdd.split('-').map(Number);
  const fecha = new Date(year, month - 1, day);
  fecha.setDate(fecha.getDate() + delta);
  return formatoFechaLocal(fecha);
}
