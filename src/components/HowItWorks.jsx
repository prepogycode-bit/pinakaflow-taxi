const STEPS = [
  {
    num: 'STEP 01',
    tone: 'blue',
    title: 'Point it at your workbook',
    body: 'The installer gives you a ready-made Credentials workbook: one row per client with a Client ID, the GST and Income Tax logins, and a QRMP / Normal / No idea mark. The Client ID keeps both logins one client, with one folder and one summary workbook.',
  },
  {
    num: 'STEP 02',
    tone: 'blue',
    title: 'Choose who runs, and for when',
    body: 'Search by name or initials, filter to Due or Overdue, tick, or select all. Then financial year, quarter, month or full year. Nothing is armed when the app opens — running the whole book is a decision you make, never a default you inherit.',
  },
  {
    num: 'STEP 03',
    tone: 'amber',
    title: 'Press Start and read the bar',
    body: 'Headless or visible, one client at a time or several at once. Captchas arrive in a queue with a countdown so none times out unnoticed. Signed-in sessions can be kept for the next task — no second login, no second captcha.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how" className="section">
      <div className="wrap">
        <div className="reveal" data-reveal>
          <span className="eyebrow">02 — HOW IT WORKS</span>
          <h2 className="h2 h2--narrow">
            Three steps, then it is a progress bar you can look away from.
          </h2>
        </div>

        <div className="stepgrid">
          {STEPS.map((s, i) => (
            <div
              key={s.num}
              className={`step step--${s.tone} reveal`}
              data-reveal
              style={{ transitionDelay: `${0.05 + i * 0.07}s` }}
            >
              <span className="step__num">{s.num}</span>
              <h3 className="step__title">{s.title}</h3>
              <p className="step__body">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
