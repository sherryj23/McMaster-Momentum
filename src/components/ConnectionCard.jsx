export default function ConnectionCard({
  icon,
  title,
  subtitle,
  connected,
  children,
}) {
  return (
    <div className="connection-card">
      <div className="card-header">
        <div className="card-icon">{icon}</div>
        <div className="card-info">
          <span className="card-title">{title}</span>
          <span className="card-subtitle">{subtitle}</span>
        </div>
        <span
          className={`status-badge ${connected ? "connected" : "not-connected"}`}
        >
          {connected ? "connected" : "not connected"}
        </span>
      </div>
      {children && <div className="card-body">{children}</div>}
    </div>
  );
}
