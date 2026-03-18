export default function Input({ label, error, className = '', ...props }) {
  return (
    <label className={`flex flex-col gap-2 text-sm text-muted ${className}`}>
      {label && <span className="font-semibold text-ink">{label}</span>}
      <input
        className={`w-full rounded-2xl border border-border bg-white/80 px-4 py-3 text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 ${
          error ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''
        }`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </label>
  );
}
