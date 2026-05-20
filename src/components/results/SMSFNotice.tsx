export function SMSFNotice() {
  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <h3 className="font-semibold text-blue-900 mb-2">SMSF / Super fund selected</h3>
      <p className="text-sm text-blue-800">
        CGT rules for self-managed superannuation funds and superannuation funds differ significantly
        from the rules for individuals, trusts and partnerships. This calculator applies to individuals,
        trusts and partnerships only.
      </p>
      <p className="text-sm text-blue-800 mt-2">
        Please consult your fund administrator or a registered tax adviser for SMSF-specific CGT
        calculations.
      </p>
    </div>
  );
}
