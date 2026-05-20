import { useId } from 'react';
import clsx from 'clsx';

interface Props {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
  disabled?: boolean;
}

export function ToggleSwitch({ label, checked, onChange, hint, disabled }: Props) {
  const id = useId();

  return (
    <div className="flex items-start gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={hint ? `${id}-hint` : undefined}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={clsx(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0 mt-0.5',
          checked ? 'bg-blue-600' : 'bg-gray-300',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <span
          className={clsx(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow',
            checked ? 'translate-x-6' : 'translate-x-1',
          )}
        />
      </button>
      <div>
        <label
          htmlFor={id}
          className={clsx('block text-sm font-medium text-gray-700 cursor-pointer', disabled && 'opacity-50')}
        >
          {label}
        </label>
        {hint && <p id={`${id}-hint`} className="text-xs text-gray-500">{hint}</p>}
      </div>
    </div>
  );
}
