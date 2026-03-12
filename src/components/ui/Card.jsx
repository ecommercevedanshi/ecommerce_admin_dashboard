const Card = ({ title, children, className = "" }) => {
  return (
    <div
      className={`surface rounded-lg p-5 ${className}`}
    >
      {title && (
        <h3 className="text-sm font-semibold mb-4 text-[var(--color-primary-hover)]">
          {title}
        </h3>
      )}

      {children}
    </div>
  );
};

export default Card;