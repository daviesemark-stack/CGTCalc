import { useCalculator } from './hooks/useCalculator';
import { DisclaimerBanner } from './components/layout/DisclaimerBanner';
import { CollapsibleSection } from './components/inputs/CollapsibleSection';
import { Section1AssetDetails } from './components/inputs/Section1AssetDetails';
import { Section2SaleDetails } from './components/inputs/Section2SaleDetails';
import { Section3IncomeTax } from './components/inputs/Section3IncomeTax';
import { Section4SmallBusiness } from './components/inputs/Section4SmallBusiness';
import { ResultsPanel } from './components/results/ResultsPanel';

export default function App() {
  const { state, results, sections12Complete, setField, dispatch } = useCalculator();
  const { inputs, section3Expanded, section4Expanded } = state;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl font-bold text-gray-900">CGT Reform Calculator</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Australian capital gains tax estimator — 2026–27 Budget proposed changes
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <DisclaimerBanner />

        <div className="lg:grid lg:grid-cols-2 lg:gap-6">
          {/* Left column — inputs */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-800 mb-4">1. Asset details</h2>
              <Section1AssetDetails inputs={inputs} setField={setField} />
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h2 className="font-semibold text-gray-800 mb-4">2. Sale details</h2>
              <Section2SaleDetails inputs={inputs} setField={setField} />
            </div>

            <CollapsibleSection
              title="3. Income and tax profile"
              isOpen={section3Expanded}
              onToggle={() => dispatch({ type: 'SET_SECTION3_EXPANDED', value: !section3Expanded })}
              isLocked={!sections12Complete}
              lockedHint="Complete sections 1 and 2 first (purchase price, dates, sale price, income)"
            >
              <Section3IncomeTax inputs={inputs} setField={setField} />
            </CollapsibleSection>

            <CollapsibleSection
              title="4. Small business CGT concessions"
              isOpen={section4Expanded}
              onToggle={() => dispatch({ type: 'SET_SECTION4_EXPANDED', value: !section4Expanded })}
              isLocked={!sections12Complete}
              lockedHint="Complete sections 1 and 2 first"
            >
              <Section4SmallBusiness inputs={inputs} setField={setField} />
            </CollapsibleSection>

            <button
              type="button"
              onClick={() => dispatch({ type: 'RESET' })}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Reset all fields
            </button>
          </div>

          {/* Right column — results (sticky on desktop) */}
          <div className="mt-6 lg:mt-0">
            <div className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h2 className="font-semibold text-gray-800 mb-4">Results</h2>
                <ResultsPanel results={results} assetType={inputs.assetType} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 mt-12 py-4 px-4">
        <p className="text-xs text-gray-400 text-center max-w-6xl mx-auto">
          This calculator is for estimation purposes only. Figures based on proposed 2026–27 Federal Budget legislation
          not yet enacted. Source: ATO guidance and Baker McKenzie analysis. Not financial advice.
        </p>
      </footer>
    </div>
  );
}
