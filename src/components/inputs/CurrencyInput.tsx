import { useState, useId } from 'react';

interface Props {
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  hint?: string;
  required?: boolean;
  placeholder?: string;
}

export function CurrencyInput({ label, value, onChange, hint, required, placeholder = '0' }: Props) {
  const id = useId();
  const [raw, setRaw] = useState(value !== null ? String(value) : '');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const stripped = e.target.value.replace(/[^0-9.]/g, '');
    setRaw(stripped);
    const num = parseFloat(stripped);
    onChange(isNaN(num) ? null : Math.round(num));
  }

  function handleBlur() {
    if (value !== null) {
      setRaw(String(value));
    } else {
      setRaw('');
    }
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 pointer-events-none">$</span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500"
          value={raw}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          aria-required={required}
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
      </div>
      {hint && <p id={`${id}-hint`} className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
