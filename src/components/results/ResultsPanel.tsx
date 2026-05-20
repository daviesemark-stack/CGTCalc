import { CalculationResults, AssetType } from '../../types';
import { SMSFNotice } from './SMSFNotice';
import { CapitalLossNotice } from './CapitalLossNotice';
import { SummaryMetrics } from './SummaryMetrics';
import { ComparisonCards } from './ComparisonCards';
import { WorkingsPanel } from './WorkingsPanel';
import { AssumptionsPanel } from './AssumptionsPanel';
import { PdfExport } from '../pdf/PdfExport';

interface Props {
  results: CalculationResults | null;
  assetType: AssetType;
}

export function ResultsPanel({ results, assetType }: Props) {
  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-6">
        <div className="text-4xl mb-3">🧮</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-1">Enter your details to get an estimate</h3>
        <p className="text-sm text-gray-500">
          Complete sections 1 and 2 — purchase price, dates, sale price — and your annual income
          to see a full CGT calculation with workings.
        </p>
      </div>
    );
  }

  if (results.isSMSF) {
    return (
      <div className="space-y-4">
        <SMSFNotice />
        <AssumptionsPanel assumptions={results.assumptions} />
      </div>
    );
  }

  if (results.isCapitalLoss) {
    return (
      <div className="space-y-4">
        <CapitalLossNotice lossAmount={results.grossGain} />
        <WorkingsPanel workings={results.workings} />
        <AssumptionsPanel assumptions={results.assumptions} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <SummaryMetrics results={results} />
      <ComparisonCards results={results} assetType={assetType} />
      <WorkingsPanel workings={results.workings} />
      <AssumptionsPanel assumptions={results.assumptions} />
      <PdfExport results={results} />
    </div>
  );
}
