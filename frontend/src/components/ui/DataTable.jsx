export default function DataTable({ columns, rows, keyField = '_id', empty }) {
  if (!rows?.length) {
    return empty || null;
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/40">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200/80 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/50">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row[keyField]}
              className="border-b border-slate-100 dark:border-slate-800/80 last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-slate-800 dark:text-slate-100 align-middle">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
