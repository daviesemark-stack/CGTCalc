import { formatCurrency } from '../../utils/formatting';

interface Props {
  lossAmount: number;
}

export function CapitalLossNotice({ lossAmount }: Props) {
  return (
    <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
      <h3 className="font-semibold text-orange-900 mb-2">Capital loss — no CGT payable</h3>
      <p className="text-sm text-orange-800">
        This asset produces a net capital loss of <strong>{formatCurrency(Math.abs(lossAmount))}</strong>.
        No capital gains tax is payable.
      </p>
      <p className="text-sm text-orange-800 mt-2">
        This loss can be carried forward to offset capital gains in future income years. Note it in
        your tax records.
      </p>
    </div>
  );
}
