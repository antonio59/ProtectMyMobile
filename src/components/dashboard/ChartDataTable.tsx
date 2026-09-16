'use client';

// Charts render as bitmaps — a <details> table underneath gives screen-reader
// users and no-JS contexts the same numbers, and gives crawlers real data.
export default function ChartDataTable({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: string[];
  rows: Array<Array<string | number>>;
}) {
  if (!rows.length) return null;
  return (
    <details className="mt-3 group">
      <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none list-none flex items-center gap-1.5">
        <span className="inline-block transition-transform group-open:rotate-90">›</span>
        View data table
      </summary>
      <div className="mt-2 overflow-x-auto max-h-64 overflow-y-auto border border-border rounded-lg">
        <table className="w-full text-xs">
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-neutral-100 sticky top-0">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  scope="col"
                  className="text-left font-semibold text-foreground px-3 py-2 whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={`px-3 py-1.5 whitespace-nowrap ${
                      j === 0 ? 'font-medium text-foreground' : 'text-muted-foreground tabular-nums'
                    }`}
                  >
                    {typeof cell === 'number' ? cell.toLocaleString('en-GB') : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
