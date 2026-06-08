function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-header">
      <div className="page-header-brand">
        <img
          src="/logo.jpeg"
          alt="Odontología & Ortodoncia"
          className="brand-logo brand-logo--sm"
        />
        <div>
          <h1 className="page-header-title">{title}</h1>
          {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </div>
  );
}

export default PageHeader;
