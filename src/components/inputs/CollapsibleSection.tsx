import { ReactNode } from 'react';
import clsx from 'clsx';

interface Props {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  isLocked?: boolean;
  lockedHint?: string;
  children: ReactNode;
}

export function CollapsibleSection({ title, isOpen, onToggle, isLocked, lockedHint, children }: Props) {
  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        type="button"
        onClick={() => !isLocked && onToggle()}
        disabled={isLocked}
        className={clsx(
          'w-full flex items-center justify-between px-4 py-3 text-left bg-gray-50 rounded-t-lg',
          isLocked ? 'cursor-not-allowed opacity-60' : 'hover:bg-gray-100',
          !isOpen && 'rounded-b-lg',
        )}
        aria-expanded={isOpen}
        title={isLocked ? lockedHint : undefined}
      >
        <span className="font-medium text-gray-800">{title}</span>
        <span className="text-gray-500 text-sm" aria-hidden="true">
          {isLocked ? '🔒' : isOpen ? '▲' : '▼'}
        </span>
      </button>
      {isOpen && !isLocked && (
        <div className="p-4 space-y-4 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
}
