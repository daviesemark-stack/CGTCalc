import { WorkingStep } from '../../types';
import { formatResult } from '../../utils/formatting';
import clsx from 'clsx';

interface Props {
  step: WorkingStep;
}

export function WorkingRow({ step }: Props) {
  if (step.isSubheader) {
    return (
      <tr className="bg-gray-100">
        <th colSpan={3} className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
          {step.label}
        </th>
      </tr>
    );
  }

  return (
    <tr className={clsx(step.isHighlighted && 'bg-amber-50 ring-1 ring-inset ring-amber-200')}>
      <td className="px-3 py-2 align-top w-5/12">
        <span className={clsx('text-sm text-gray-800', step.isHighlighted && 'font-semibold')}>
          {step.label}
        </span>
        {step.note && (
          <p className="text-xs text-gray-500 mt-0.5">{step.note}</p>
        )}
      </td>
      <td className="px-3 py-2 align-top w-4/12">
        <code className="text-xs font-mono text-gray-500 break-all">{step.formula}</code>
      </td>
      <td className="px-3 py-2 align-top text-right w-3/12">
        <span className={clsx('text-sm tabular-nums', step.isHighlighted && 'font-semibold text-gray-900')}>
          {typeof step.result === 'number'
            ? formatResult(step.result)
            : step.result}
        </span>
      </td>
    </tr>
  );
}
