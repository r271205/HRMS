export default function Select({ label, error, options = [], className = '', id, ...props }) {
  const selectId = id || props.name;
  return (
    <label className="block w-full">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
      )}
      <select
        id={selectId}
        className={`w-full rounded-xl border bg-white/90 dark:bg-slate-900/80 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none transition focus:ring-2 focus:ring-brand-500/40 ${
          error ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'
        } ${className}`}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </label>
  );
}
