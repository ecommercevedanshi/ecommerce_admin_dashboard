const StatCard = ({ label, value, change }) => {
  return (
    <div className="surface-light rounded-lg p-5 border border-[var(--border-color-secondary)]">

      <div className="text-sm text-[var(--text-muted)]">
        {label}
      </div>

      <div className="text-2xl font-semibold mt-1">
        {value}
      </div>

      {change && (
        <div className="text-xs text-[var(--color-primary)] mt-1">
          {change}
        </div>
      )}

    </div>
  );
};

export default StatCard;