import { WorkingStep } from '../../types';
import { WorkingRow } from './WorkingRow';

interface Props {
  workings: WorkingStep[];
}

export function WorkingsPanel({ workings }: Props) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Full workings</h3>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-5/12">Step</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-4/12">Formula</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase w-3/12">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {workings.map(step => (
              <WorkingRow key={step.id} step={step} />
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="px-3 py-2 bg-amber-50 text-xs text-amber-900 border-t border-amber-200">
                <strong>Proposed legislation only.</strong> Not financial or tax advice. Figures are estimates only.
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
