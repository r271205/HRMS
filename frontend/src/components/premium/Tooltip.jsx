export default function Tooltip({ children, label, side = 'top' }) {
  const pos =
    side === 'bottom'
      ? 'top-full mt-2 left-1/2 -translate-x-1/2'
      : 'bottom-full mb-2 left-1/2 -translate-x-1/2';
  return (
    <span className="relative group inline-flex">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute ${pos} z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 dark:bg-white dark:text-slate-900`}
      >
        {label}
      </span>
    </span>
  );
}
