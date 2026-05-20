export function DisclaimerBanner() {
  return (
    <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-6" role="alert">
      <div className="flex gap-3">
        <span className="text-amber-600 text-xl flex-shrink-0" aria-hidden="true">⚠</span>
        <div className="text-sm text-amber-900">
          <p className="font-semibold mb-1">Proposed legislation only</p>
          <p>
            The CGT changes announced in the 2026–27 Federal Budget have not yet passed Parliament
            and may change before enactment. Results produced by this calculator are estimates only
            and do not constitute financial, legal, or tax advice. You should consult a registered
            tax adviser before making investment decisions based on these estimates.
          </p>
        </div>
      </div>
    </div>
  );
}
