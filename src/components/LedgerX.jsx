import { useEffect, useState } from 'react'
import Icon from './Icon.jsx'
import { ledgerx, site } from '../site.config.js'

// LedgerX: PinakaFlow's Excel / bank statement / GSTR-2B -> Tally tool. Its own
// palette (navy, and the blue -> teal -> green of its logo), set as custom
// properties on the section so nothing leaks into the TAXI styles.

const FEATURES = [
  {
    glyph: 'upload_file',
    title: 'Excel to Tally, in one press',
    body: 'Bank, Journal (up to 3 Dr / 3 Cr), Purchase, Sales and Ledgers from one template. GST is split for you, every voucher is balance-checked to the paisa, and an invoice number becomes a bill-wise reference.',
  },
  {
    glyph: 'account_balance',
    title: 'Bank statement, converted',
    body: 'LedgerX reads every date and amount itself and checks each row against the running balance. AI (your own Gemini or NVIDIA key) only suggests the ledger, chosen from the ledgers already in your Tally.',
  },
  {
    glyph: 'receipt_long',
    title: 'GSTR-2B to purchase vouchers',
    body: 'B2B invoices, credit and debit notes, RCM, ineligible ITC and round-offs, with each party matched by GSTIN. Earlier-year bills and anything unusual are listed, not guessed.',
  },
  {
    glyph: 'fact_check',
    title: 'Checked before it posts',
    body: 'Pick the company, see which ledgers are missing, skip duplicates already in the Day Book, and never alter a ledger that exists. Unsure rows go to Suspense with a Please Check sheet.',
  },
]

// The scripted convert page: [label, ledger, confidence] per row.
const ROWS = [
  ['UPI/ACME SUPPLIES/INV 2231', 'Acme Supplies', 'high'],
  ['NEFT-RENT APR-26', 'Office Rent', 'high'],
  ['POS 4411 STATIONERY MART', 'Printing & Stationery', 'high'],
  ['IMPS/REF 88213/PAYTM', 'Suspense A/c', 'low'],
  ['CHQ 004512 SHARMA TRADERS', 'Sharma Traders', 'high'],
]

const STAGES = [
  ['Reading statement', 12],
  ['Checking running balances', 34],
  ['Allotting ledgers', 62],
  ['Allotting ledgers', 84],
  ['Ready to import', 100],
]

const STEP_MS = 1700

function LedgerXMock() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % (STAGES.length + 2)), STEP_MS)
    return () => clearInterval(t)
  }, [])

  const stage = Math.min(step, STAGES.length - 1)
  const [label, pct] = STAGES[stage]
  // Rows appear once the balances are checked, a few at a time.
  const visible = stage < 2 ? 0 : stage === 2 ? 2 : stage === 3 ? 4 : ROWS.length

  return (
    <div className="lx-app" aria-hidden="true">
      <aside className="lx-app__side">
        <div className="lx-app__brand">
          <img src="./assets/ledgerx-mark.png" alt="" />
          <span>
            Ledger<b>X</b>
          </span>
        </div>
        <div className="lx-app__label">WORKSPACE</div>
        {[
          ['download', 'Import'],
          ['account_balance', 'Convert statement'],
          ['shopping_cart', 'GSTR-2B purchases'],
          ['history', 'History'],
          ['settings', 'Settings'],
        ].map(([glyph, name]) => (
          <div key={name} className={`lx-app__nav${name === 'Convert statement' ? ' is-on' : ''}`}>
            <Icon name={glyph} />
            {name}
          </div>
        ))}
        <div className="lx-app__tally">
          <span className="lx-app__dot" />
          <span>
            <strong>Tally connected</strong>
            <small>Demo Traders Pvt Ltd</small>
          </span>
        </div>
      </aside>

      <div className="lx-app__main">
        <div className="lx-app__title">Convert a bank statement</div>
        <div className="lx-app__sub">
          LedgerX reads every amount itself. The AI only chooses the ledgers.
        </div>

        <div className="lx-app__card">
          {[
            ['Statement', 'HDFC_April_2026.csv'],
            ['Bank ledger', 'HDFC Current A/c'],
            ['Masters', '✓ 64 ledgers and 28 groups read from Tally'],
          ].map(([k, v]) => (
            <div key={k} className="lx-app__row">
              <span className="lx-app__key">{k}</span>
              <span className={`lx-app__val${k === 'Masters' ? ' is-ok' : ''}`}>{v}</span>
            </div>
          ))}
        </div>

        <div className={`lx-app__check${stage >= 1 ? ' is-on' : ''}`}>
          <strong>30 transactions</strong> · 01-04-2026 to 15-04-2026
          <span>
            {stage >= 2
              ? '✓ All 29 running balances reconcile — nothing missing or misread.'
              : 'Checking every row against the running balance…'}
          </span>
        </div>

        <div className="lx-app__bar">
          <div className="lx-app__barfill" style={{ width: `${pct}%` }} />
          <span>
            {label} · {pct}%
          </span>
        </div>

        <div className="lx-app__table">
          <div className="lx-app__thead">
            <span>Narration</span>
            <span>Ledger</span>
            <span>Confidence</span>
          </div>
          {ROWS.slice(0, visible).map(([narr, led, conf]) => (
            <div key={narr} className="lx-app__tr">
              <span className="lx-app__narr">{narr}</span>
              <span className={conf === 'low' ? 'is-suspense' : ''}>{led}</span>
              <span className={`lx-app__conf lx-app__conf--${conf}`}>
                {conf === 'low' ? 'Please check' : 'High'}
              </span>
            </div>
          ))}
          {visible === 0 && <div className="lx-app__empty">Ledgers appear here as they are chosen.</div>}
        </div>
      </div>
    </div>
  )
}

export default function LedgerX({ standalone = false }) {
  const href =
    ledgerx.downloadUrl ||
    `mailto:${site.supportEmail}?subject=${encodeURIComponent('LedgerX for my firm')}`

  return (
    <section id="ledgerx" className={`section lx${standalone ? ' lx--page' : ''}`}>
      <div className="wrap">
        <div className="lx__head reveal" data-reveal>
          <div>
            <span className="eyebrow">
              {standalone ? 'PINAKAFLOW LEDGERX — FOR TALLYPRIME' : '07 — ALSO FROM PINAKAFLOW'}
            </span>
            <div className="lx__brand">
              <img className="lx__logo" src="./assets/ledgerx-mark.png" alt="LedgerX logo" />
              <h2 className="h2 lx__title">
                <span>
                  Ledger<span className="lx__x">X</span>
                </span>
                <span className="lx__tag">Your books, into Tally.</span>
              </h2>
            </div>
            <p className="lede">
              TAXI brings the returns down from the portals. LedgerX takes the other half of the
              work: bank statements, purchase registers and GSTR-2B into TallyPrime as checked,
              balanced vouchers, without retyping a single figure.
            </p>
            <div className="lx__actions">
              <a className="btn lx__btn btn--lg" href={href}>
                <Icon name={ledgerx.downloadUrl ? 'download' : 'mail'} />
                {ledgerx.downloadUrl ? 'Download LedgerX' : 'Ask for LedgerX'}
              </a>
              <span className="hero__meta lx__meta">
                LEDGERX v{ledgerx.version} &nbsp;·&nbsp; WINDOWS 10 / 11 &nbsp;·&nbsp; TALLYPRIME
              </span>
            </div>
          </div>
          <LedgerXMock />
        </div>

        <div id="ledgerx-features" className="lx__grid">
          {FEATURES.map((c, i) => (
            <div
              key={c.title}
              className="lx__card reveal"
              data-reveal
              style={{ '--d': `${0.05 + i * 0.07}s` }}
            >
              <span className="lx__icon">
                <Icon name={c.glyph} />
              </span>
              <h3 className="lx__cardtitle">{c.title}</h3>
              <p className="lx__cardbody">{c.body}</p>
            </div>
          ))}
        </div>

        <p className="lx__note reveal" data-reveal>
          <Icon name="verified_user" />
          Amounts never come from the AI. It suggests ledgers only; every figure is read from the
          bank&#39;s own file and reconciled before anything reaches Tally.
        </p>
      </div>
    </section>
  )
}
