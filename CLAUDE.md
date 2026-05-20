# CGT Reform Calculator — Build Specification

## Project overview

A client-side web calculator that helps Australian taxpayers estimate their capital gains tax
liability under the proposed 2026–27 federal budget changes. The calculator compares the current
50% CGT discount regime against the new CPI indexation + 30% minimum tax regime, shows all
workings transparently, and handles transitional rules for assets straddling 1 July 2027.

**Legislation status:** Proposed only — not yet passed Parliament as at May 2026. Every output
must carry a prominent disclaimer to this effect, and results must be described as estimates only.

---

## Tech stack

- **Framework:** React (single-page, no backend required)
- **Styling:** Tailwind CSS utility classes
- **State:** React `useState` / `useReducer` — no localStorage or external state
- **Charts:** Recharts (optional — for a comparison bar chart on results)
- **No API calls** — all logic runs client-side

---

## Calculator logic

### Key dates and regime triggers

| Acquisition date | Sale date | Negative gearing | CGT regime |
|---|---|---|---|
| Before 12 May 2026 7:30pm AEST | Any | Unrestricted (grandfathered) | Old rules for all gains |
| 12 May 2026 – 30 Jun 2027 | Before 1 Jul 2027 | Available during period only | Old 50% discount |
| 12 May 2026 – 30 Jun 2027 | After 1 Jul 2027 | Not available from 1 Jul 2027 | Transitional split |
| From 1 Jul 2027 | Any | New builds only | New regime fully |

### Transitional split (assets owned before, sold after 1 July 2027)

For assets acquired before 1 July 2027 and sold after:

1. Determine the asset's value at 1 July 2027 (see "Valuation methods" below)
2. Pre-2027 gain = (value at 1 Jul 2027) − adjusted cost base → apply 50% discount
3. Post-2027 gain = sale proceeds − value at 1 Jul 2027 → apply CPI indexation
4. Sum both taxable gains; apply marginal rate; check 30% minimum tax floor

### Valuation methods for 1 July 2027

Two methods must be supported (user selects):

**Method A — ATO apportionment formula (time-weighted)**
```
value_at_2027 = cost_base × (1 + annual_growth_rate) ^ years_held_to_2027

annual_growth_rate = (sale_price / cost_base) ^ (1 / total_years_held) − 1
years_held_to_2027 = days from acquisition to 1 Jul 2027 / 365.25
```

**Method B — actual valuation**
User enters a dollar figure directly (e.g. from a formal appraisal or quoted share price).

Always show which method is being used in the workings panel.

### CPI indexation (post-2027 gains)

```
indexed_cost_base = value_at_2027 × (1 + cpi_rate) ^ years_post_2027
real_gain = sale_proceeds − indexed_cost_base
taxable_post_2027_gain = max(real_gain − capital_losses_applied, 0)
```

Where `years_post_2027` = days from 1 Jul 2027 to sale date / 365.25

The CPI rate is user-configurable (default 2.5%). Show the formula and intermediate values.

### 50% CGT discount (pre-2027 gains and new builds)

```
discounted_pre_gain = (value_at_2027 − adjusted_cost_base) × 0.50
```

Only available for assets held > 12 months. New builds may choose either method at sale.

### 30% minimum tax

Applies to real (post-indexation) gains accruing from 1 July 2027:

```
gain_tax_at_marginal = taxable_post_gain × marginal_rate
minimum_tax_required = taxable_post_gain × 0.30
additional_minimum_tax = max(minimum_tax_required − gain_tax_at_marginal, 0)
```

**Exemptions — do NOT apply the minimum tax if:**
- Taxpayer is an SMSF or super fund (different discount rules apply)
- Taxpayer received a means-tested income support payment (Age Pension, JobSeeker, etc.)
  in the financial year in which the gain is realised

### Marginal tax rates (resident individuals, from 1 July 2027)

| Taxable income | Rate |
|---|---|
| $0 – $18,200 | 0% |
| $18,201 – $45,000 | 14% |
| $45,001 – $135,000 | 30% |
| $135,001 – $190,000 | 37% |
| $190,001+ | 45% |

Medicare levy: +2% (applies above Medicare low-income threshold; default ON, user can toggle off).

Calculate the marginal rate by stacking (income + total taxable gain) and finding the top bracket.

### Capital losses

Apply losses in this order:
1. Offset current-year capital losses against gains first
2. Then prior-year carried-forward losses
3. Apply to pre-2027 gain first (since it benefits more from the 50% discount), or allow user
   to toggle optimal vs manual allocation

### Small business CGT concessions

Apply in the ATO-mandated order. Each step reduces the remaining gain:

1. **15-year exemption** — entire gain disregarded. Stop here if eligible.
   - Requires: continuous ownership ≥ 15 years; significant individual aged ≥ 55 or permanently
     incapacitated; asset is an active asset
2. **Capital losses** — applied at this point if 15-year exemption does not apply
3. **CGT discount** — 50% for individuals/trusts (applies to gain after losses)
4. **50% active asset reduction** — applies automatically to remaining gain if basic conditions met;
   user can opt out if preferring another concession
5. **Retirement exemption** — up to $500,000 lifetime limit; reduces remaining gain
6. **Small business rollover** — defers remaining gain

**Basic eligibility (step 1 gate):**
- Aggregated turnover < $2M (include affiliates and connected entities), OR
- Net assets ≤ $6M (including affiliates/connected entities, excluding personal use assets and
  superannuation), AND
- Asset passes the active asset test (active for at least half the ownership period, or 7.5 years
  if held > 15 years)

Show which concessions were applied, in order, with amounts at each step.

### Adjusted cost base

```
adjusted_cost_base = purchase_price
                   + acquisition_costs        // stamp duty, legal/conveyancing
                   + capital_improvements     // structural additions, not repairs
                   + buying_brokerage         // shares only
                   − depreciation_claimed     // optional; reduces cost base
```

Selling costs (agent fees, legal, brokerage) reduce capital proceeds, not cost base:
```
net_proceeds = sale_price − selling_costs
gross_gain   = net_proceeds − adjusted_cost_base
```

---

## Input fields

### Section 1 — asset details

| Field | Type | Default | Notes |
|---|---|---|---|
| Asset type | Select | Residential — established | Options: Residential established, Residential new build, Commercial property, Shares/ETFs, Other CGT asset |
| Entity type | Select | Individual | Options: Individual, Trust/Partnership, Company, SMSF/Super fund |
| Purchase price | Currency | — | Required |
| Date of acquisition | Date | — | Required; drives regime determination |
| Acquisition costs | Currency | $0 | Stamp duty, legal fees |
| Capital improvements | Currency | $0 | Not repairs |
| Depreciation claimed | Currency | $0 | Optional; reduces cost base |

### Section 2 — sale and transitional values

| Field | Type | Default | Notes |
|---|---|---|---|
| Expected sale price | Currency | — | Required |
| Expected sale date | Date | — | Required |
| Selling costs | Currency | $0 | Agent fees, legal, brokerage |
| 1 Jul 2027 valuation method | Radio | ATO formula | ATO apportionment formula OR actual valuation |
| Valuation at 1 Jul 2027 | Currency | — | Only shown if "actual valuation" selected |

### Section 3 — income and tax profile

| Field | Type | Default | Notes |
|---|---|---|---|
| Annual taxable income | Currency | — | Excluding the capital gain |
| CPI rate assumption | Percentage | 2.5% | Applied annually; user-adjustable |
| Current-year capital losses | Currency | $0 | Applied before concessions |
| Prior-year carried-forward losses | Currency | $0 | |
| Income support recipient | Toggle | Off | Exempts from 30% minimum tax |
| Include Medicare levy | Toggle | On | Adds 2% to marginal rate |
| Australian tax resident | Toggle | On | Non-residents: flat 30% from $0, no tax-free threshold |
| Held > 12 months | Auto-calculated | — | Derived from dates; show warning if < 12 months |

### Section 4 — small business CGT concessions

| Field | Type | Default | Notes |
|---|---|---|---|
| Apply small business concessions | Toggle | Off | Reveals sub-fields when ON |
| Eligibility basis | Radio | Aggregated turnover | Turnover < $2M OR max net asset value ≤ $6M |
| Aggregated turnover | Currency | — | Required if turnover test selected |
| Net asset value | Currency | — | Required if MNAV test selected |
| Active asset confirmed | Checkbox | — | User confirms asset passes active asset test |
| Concession(s) to apply | Multi-select | 50% active asset reduction | 15-year exemption, 50% active asset, retirement exemption, rollover |
| Age (for 15-year exemption) | Number | — | Must be ≥ 55 for 15-year exemption |
| Retirement exemption cap remaining | Currency | $500,000 | Lifetime limit |

---

## Output — results panel

### Summary metrics (always visible)

- Total nominal gain (gross, before any discounts or losses)
- Taxable capital gain (after all reductions)
- Estimated tax payable
- Effective rate on nominal gain (%)
- Additional tax vs current rules (+ or −, with colour coding)

### Comparison cards

Side by side:
- **Current rules** — 50% discount applied to full gain; tax at marginal rate
- **New rules** — transitional split; pre-2027 at 50%, post-2027 at CPI indexation + 30% min tax

For new builds, add a third card showing the user's better option (they may choose either method).

### Full workings panel

Show every intermediate step as labelled rows. Each row must show:
- A plain-English description of what is being calculated
- The formula used (rendered as `formula` text, not LaTeX)
- The numeric result

Steps to show:
1. Adjusted cost base calculation
2. Net proceeds calculation
3. Transitional split — value at 1 Jul 2027 and formula used
4. Pre-2027 gain → 50% discount → taxable amount
5. Post-2027 gain → CPI indexed cost base → real gain → taxable amount
6. Loss offset (show which losses applied, to which gain, in what order)
7. Small business concessions (if applicable — show each step)
8. Combined taxable gain
9. Marginal rate stacking (show income + gain stacked across brackets)
10. Minimum tax check (show comparison of marginal rate tax vs 30% floor)
11. Medicare levy calculation (if applicable)
12. Total tax payable

All currency values rounded to the nearest dollar. Percentages to 2 decimal places.

### Assumptions panel

Always render a collapsible (default open) "Assumptions and notes" section listing:
- Which regime applies and why (driven by acquisition date)
- Which 1 Jul 2027 valuation method was used
- CPI rate assumption
- Whether minimum tax applied or was exempt and why
- Which (if any) small business concessions were applied
- Any ATO-mandated ordering applied
- Disclaimer: "Proposed legislation only. Not financial or tax advice. Figures are estimates."

---

## Edge cases and validation

| Scenario | Behaviour |
|---|---|
| Asset acquired and sold before 1 Jul 2027 | Old 50% discount rules fully apply; no transitional split |
| Asset acquired after 1 Jul 2027 | New rules apply in full; no split needed |
| Holding period < 12 months | No CGT discount available; warn user; tax at full marginal rate |
| Capital loss (gain is negative) | Show net loss; no CGT payable; prompt user to note carry-forward |
| SMSF / super fund entity type | Show note: "CGT rules for super funds differ. This calculator applies to individuals, trusts and partnerships. Consult your fund administrator." |
| Non-resident | Remove tax-free threshold; apply non-resident rates; disable Medicare levy toggle |
| New build — method choice | Show both options; highlight whichever produces lower tax |
| Pre-1985 asset | Pre-2027 gains on pre-1985 assets remain exempt; only post-2027 gains taxable |
| Income support exemption ON | Skip minimum tax calculation; show note in workings |
| 15-year exemption eligible | Entire gain is disregarded; show $0 tax with explanation |
| Retirement exemption | Cap remaining lifetime limit at $500,000; show how much of the gain is sheltered |

---

## UI/UX requirements

- **Progressive disclosure:** Show Sections 3 and 4 collapsed by default; expand when user has
  completed Sections 1 and 2
- **Live recalculation:** Results update on every input change (no separate "calculate" button
  needed, though one may be shown for clarity)
- **Sticky results:** On desktop, the results panel should be visible alongside the inputs
  (two-column layout at ≥ 900px viewport)
- **Print/export:** Provide a "Download PDF summary" button that renders the workings to a
  clean printable layout
- **Accessibility:** All inputs have associated labels; colour is never the sole indicator of
  meaning; results are announced to screen readers via aria-live
- **Mobile:** Single-column layout; results appear below all inputs
- **No login required:** Entirely client-side; no data is sent to any server

---

## Disclaimer requirements

The following disclaimer must appear:
1. At the top of the page, in an amber/warning callout box
2. At the bottom of every workings output
3. In any downloadable PDF output

> **Proposed legislation only.** The CGT changes announced in the 2026–27 Federal Budget have
> not yet passed Parliament and may change before enactment. Results produced by this calculator
> are estimates only and do not constitute financial, legal, or tax advice. You should consult a
> registered tax adviser before making investment decisions based on these estimates.

---

## Source references

- Budget 2026–27 Fact Sheet: *Negative Gearing and Capital Gains Tax Reform*
  https://budget.gov.au/content/factsheets/download/tax-explainers-negative-gearing-capital-gains-tax.pdf
- ATO: *Small business CGT concessions — eligibility conditions*
  https://www.ato.gov.au/businesses-and-organisations/income-deductions-and-concessions/capital-gains-tax/small-business-cgt-concessions
- ATO: *Tax rates — Australian residents*
  https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents
- Baker McKenzie analysis: https://www.bakermckenzie.com/en/insight/publications/2026/05/australia-budget-bites-cgt-discount-and-negative-gearing