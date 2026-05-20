import { useId } from 'react';

interface Props {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  hint?: string;
  required?: boolean;
  min?: string;
  max?: string;
}

export function DateInput({ label, value, onChange, hint, required, min, max }: Props) {
  const id = useId();

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      <input
        id={id}
        type="date"
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500"
        value={value ?? ''}
        onChange={e => onChange(e.target.value || null)}
        required={required}
        min={min}
        max={max}
        aria-describedby={hint ? `${id}-hint` : undefined}
      />
      {hint && <p id={`${id}-hint`} className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
