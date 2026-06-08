const ESTADO_TURNO = {
  pendiente: { className: 'badge-pendiente', label: 'Pendiente' },
  confirmado: { className: 'badge-confirmado', label: 'Confirmado' },
  realizado: { className: 'badge-realizado', label: 'Realizado' },
  cancelado: { className: 'badge-cancelado', label: 'Cancelado' },
};

function Badge({ children, variant = 'default', estado }) {
  if (estado && ESTADO_TURNO[estado]) {
    const e = ESTADO_TURNO[estado];
    return <span className={`badge ${e.className}`}>{e.label}</span>;
  }
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

export default Badge;
export { ESTADO_TURNO };
