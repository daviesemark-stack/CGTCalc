# CGT Reform Calculator

A client-side Australian capital gains tax estimator for the proposed 2026–27 Federal Budget changes. Compare the current 50% CGT discount against the new CPI indexation + 30% minimum tax regime, with full transparency of every calculation step.

**Live site:** _add link once deployed_

> **Proposed legislation only.** The CGT changes announced in the 2026–27 Federal Budget have not yet passed Parliament and may change before enactment. Results are estimates only and do not constitute financial, legal, or tax advice.

---

## What it does

- Determines which CGT regime applies based on acquisition and sale dates (pre-CGT, old rules, transitional, or new rules fully)
- For transitional assets (acquired before 1 July 2027, sold after): splits the gain at 1 July 2027 using either the ATO apportionment formula or an actual valuation
- Applies CPI indexation to the post-2027 portion and checks the 30% minimum tax floor
- Handles small business CGT concessions in ATO-mandated order (15-year exemption, active asset reduction, retirement exemption, rollover)
- Shows every intermediate calculation step in a workings panel
- Compares current-rules tax vs new-rules tax side by side
- Exports a PDF summary of the full workings

All logic runs entirely client-side. No data entered into the calculator is transmitted to any server.

---

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

> **Windows note:** The dev server must be started from your own terminal. The webpack dev server cannot be spawned from within some sandboxed environments.

### Other commands

```bash
npm run build       # Production bundle → dist/
npm run typecheck   # TypeScript check without emitting
```

---

## Tech stack

| Layer | Library |
|---|---|
| UI framework | React 19 |
| Language | TypeScript 5.7 |
| Styling | Tailwind CSS 3 |
| Charts | Recharts |
| PDF export | jsPDF + html2canvas |
| Bundler | Webpack 5 + ts-loader |

---

## Project structure

```
src/
├── engine/          # Pure TypeScript calculation logic (no React)
│   ├── calculate.ts       # Master orchestrator
│   ├── transitional.ts    # ATO apportionment formula + pre/post split
│   ├── marginalRate.ts    # Bracket stacking + marginal tax
│   ├── minimumTax.ts      # 30% minimum tax floor
│   ├── smallBusiness.ts   # SB concessions in ATO order
│   ├── acb.ts             # Adjusted cost base
│   ├── losses.ts          # Capital loss offsets
│   ├── regime.ts          # Regime determination
│   └── constants.ts       # Tax brackets, key dates, thresholds
├── components/
│   ├── inputs/      # Input sections 1–4 + primitive controls
│   └── results/     # WorkingsPanel, ComparisonCards, SummaryMetrics
├── data/
│   └── absBusinessData.ts # ABS business count data for SB comparison widget
├── hooks/
│   └── useCalculator.ts   # useReducer form state + useMemo results
└── types/
    └── index.ts     # All interfaces and enums
```

---

## CGT regime rules implemented

| Acquisition date | Sale date | Regime |
|---|---|---|
| Before 20 Sep 1985 | Any | Pre-CGT (post-2027 gain only) |
| Before 12 May 2026 7:30pm AEST | Any | Old rules — 50% discount |
| 12 May 2026 – 30 Jun 2027 | Before 1 Jul 2027 | Old rules — 50% discount |
| 12 May 2026 – 30 Jun 2027 | After 1 Jul 2027 | Transitional split |
| From 1 Jul 2027 | Any | New rules fully |

---

## Sources

- [Budget 2026–27 Fact Sheet — Negative Gearing and Capital Gains Tax Reform](https://budget.gov.au/content/factsheets/download/tax-explainers-negative-gearing-capital-gains-tax.pdf)
- [ATO — Small business CGT concessions](https://www.ato.gov.au/businesses-and-organisations/income-deductions-and-concessions/capital-gains-tax/small-business-cgt-concessions)
- [ATO — Tax rates: Australian residents](https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents)
- [ABS Cat. 8165.0 — Counts of Australian Businesses, June 2023](https://www.abs.gov.au/statistics/economy/business-indicators/counts-australian-businesses-including-entries-and-exits/latest-release)
- [Baker McKenzie analysis](https://www.bakermckenzie.com/en/insight/publications/2026/05/australia-budget-bites-cgt-discount-and-negative-gearing)
