import { useState } from 'react';

interface Props {
  assumptions: string[];
}

export function AssumptionsPanel({ assumptions }: Props) {
  const [open, setOpen] = useState(true);

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left bg-gray-50 rounded-t-lg hover:bg-gray-100"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-gray-700">Assumptions and notes</span>
        <span className="text-gray-500 text-sm" aria-hidden="true">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="px-4 py-3 border-t border-gray-200">
          <ul className="space-y-1.5">
            {assumptions.map((a, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span className="text-gray-400 flex-shrink-0 mt-0.5">•</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
