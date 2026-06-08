function Spinner({ label = 'Cargando...' }) {
  return (
    <div className="spinner-wrap" role="status">
      <div className="spinner" />
      {label && <span className="spinner-label">{label}</span>}
    </div>
  );
}

export default Spinner;
