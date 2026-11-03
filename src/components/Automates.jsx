import Icon from './Icon.jsx'

const CARDS = [
  {
    glyph: 'description',
    tone: '3b',
    title: 'GSTR-3B',
    body: 'The filed summary as PDF, per month, per quarter or the whole year. QRMP clients are marked once in the workbook, or found on the portal when you mark "No idea".',
    file: 'GSTR-3B (April 2025).pdf',
  },
  {
    glyph: 'list_alt',
    tone: '1',
    title: 'GSTR-1',
    body: 'PDF of the filed summary — the document the practice actually files. The JSON route was retired deliberately rather than left half-working.',
    file: 'GSTR-1 (April 2025).pdf',
  },
  {
    glyph: 'download',
    tone: '2b',
    title: 'GSTR-2B',
    body: 'Summary PDF, the full details workbook, or B2B invoices only — whichever your reconciliation actually starts from.',
    file: 'GSTR-2B B2B Invoices (April 2025).xlsx',
  },
  {
    glyph: 'account_balance',
    tone: 'itr',
    title: 'ITR + AIS / TIS',
    body: 'Returns (form, receipt, JSON), AIS, TIS and Form 26AS for the years you pick — or the whole kit in one press. Assessment year is derived from the financial year, not typed twice.',
    file: 'ITR Acknowledgement (AY 2025-26).pdf',
  },
]

export default function Automates() {
  return (
    <section id="automates" className="section section--tint">
      <div className="wrap">
        <div className="reveal" data-reveal>
          <span className="eyebrow">01 — WHAT IT AUTOMATES</span>
          <h2 className="h2">
            Four portals&#39; worth of downloading, done while you do the work that bills.
          </h2>
          <p className="lede">
            Every download in every module is named through one table, so the same file has the same
            name whichever return it came from.
          </p>
        </div>

        <div className="cardgrid">
          {CARDS.map((c, i) => (
            <div
              key={c.title}
              className={`featurecard featurecard--${c.tone} reveal`}
              data-reveal
              style={{ '--d': `${0.05 + i * 0.07}s` }}
            >
              <span className={`featurecard__icon featurecard__icon--${c.tone}`}>
                <Icon name={c.glyph} />
              </span>
              <h3 className="featurecard__title">{c.title}</h3>
              <p className="featurecard__body">{c.body}</p>
              <code className="featurecard__file">{c.file}</code>
            </div>
          ))}
        </div>

        <div className="statusband reveal" data-reveal>
          <span className="statusband__icon">
            <Icon name="event_upcoming" />
          </span>
          <div className="statusband__text">
            <strong>And what is due next, for every client.</strong>
            <span>
              Update database reads each client&#39;s Track Return Status, five at a time. Every row
              then shows its next due return, or what is overdue, and the list filters by Filed, Due
              and Overdue.
            </span>
          </div>
          <span className="statusband__tags">
            <span className="duetag duetag--lg" style={{ background: '#FFF4E5', color: '#B54708' }}>
              GSTR-1 Sep · due 11 Oct
            </span>
            <span className="duetag duetag--lg" style={{ background: '#FDECEC', color: '#B42318' }}>
              GSTR-3B Aug · overdue
            </span>
            <span className="duetag duetag--lg" style={{ background: '#ECFDF3', color: '#067647' }}>
              ✓ Filed to Sep
            </span>
          </span>
        </div>
      </div>
    </section>
  )
}
