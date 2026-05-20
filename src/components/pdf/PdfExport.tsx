import { useRef, useState } from 'react';
import { CalculationResults } from '../../types';
import { formatCurrency, formatPercent } from '../../utils/formatting';

interface Props {
  results: CalculationResults;
}

export function PdfExport({ results }: Props) {
  const printRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    if (!printRef.current) return;
    setLoading(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const imgWidth = pageWidth - margin * 2;

      // How many canvas pixels equal one mm on the page
      const pixelsPerMm = canvas.width / imgWidth;
      const pageHeightPx = (pageHeight - margin * 2) * pixelsPerMm;

      let srcY = 0;
      while (srcY < canvas.height) {
        if (srcY > 0) pdf.addPage();

        const sliceHeightPx = Math.min(pageHeightPx, canvas.height - srcY);

        // Crop this page's slice from the full canvas
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sliceHeightPx;
        const ctx = sliceCanvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
        ctx.drawImage(canvas, 0, srcY, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);

        pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', margin, margin, imgWidth, sliceHeightPx / pixelsPerMm);
        srcY += sliceHeightPx;
      }

      pdf.save('CGT-estimate.pdf');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleDownload}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Generating PDF…' : '↓ Download PDF summary'}
      </button>

      {/* Off-screen print target — display:none prevents html2canvas from rendering */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0, width: 0, overflow: 'hidden' }}>
        <div ref={printRef} className="p-6 bg-white text-sm font-sans text-gray-900 w-[700px]">
          <h1 className="text-xl font-bold mb-1">CGT Reform Calculator — Estimate</h1>
          <p className="text-xs text-gray-500 mb-4">Generated {new Date().toLocaleDateString('en-AU')}</p>

          <div className="bg-amber-50 border border-amber-300 rounded p-3 mb-4 text-xs text-amber-900">
            <strong>Proposed legislation only.</strong> The CGT changes announced in the 2026–27 Federal
            Budget have not yet passed Parliament. Results are estimates only and do not constitute
            financial, legal, or tax advice. Consult a registered tax adviser before making investment decisions.
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              ['Gross nominal gain', formatCurrency(results.grossGain)],
              ['Taxable capital gain', formatCurrency(results.combinedTaxableGain)],
              ['Estimated tax payable', formatCurrency(results.totalTaxPayable)],
              ['Effective rate', formatPercent(results.effectiveRate)],
              ['Current rules tax', formatCurrency(results.currentRulesTax)],
              ['New rules tax', formatCurrency(results.newRulesTax)],
            ].map(([label, value]) => (
              <div key={label} className="border border-gray-200 rounded p-2">
                <div className="text-xs text-gray-500">{label}</div>
                <div className="font-semibold">{value}</div>
              </div>
            ))}
          </div>

          <h2 className="font-semibold text-base mb-2">Full workings</h2>
          <table className="w-full text-xs border-collapse mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-1 border border-gray-200 w-5/12">Step</th>
                <th className="text-left p-1 border border-gray-200 w-4/12">Formula</th>
                <th className="text-right p-1 border border-gray-200 w-3/12">Result</th>
              </tr>
            </thead>
            <tbody>
              {results.workings.map(step =>
                step.isSubheader ? (
                  <tr key={step.id} className="bg-gray-50">
                    <td colSpan={3} className="p-1 border border-gray-200 font-semibold text-gray-600 uppercase text-xs tracking-wide">
                      {step.label}
                    </td>
                  </tr>
                ) : (
                  <tr key={step.id} className={step.isHighlighted ? 'bg-amber-50 font-semibold' : ''}>
                    <td className="p-1 border border-gray-200 align-top">{step.label}</td>
                    <td className="p-1 border border-gray-200 font-mono align-top">{step.formula}</td>
                    <td className="p-1 border border-gray-200 text-right tabular-nums">
                      {typeof step.result === 'number' ? formatCurrency(step.result) : step.result}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          <h2 className="font-semibold text-base mb-2">Assumptions</h2>
          <ul className="list-disc list-inside space-y-0.5 text-xs text-gray-700">
            {results.assumptions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
