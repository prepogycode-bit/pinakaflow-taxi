import Icon from './Icon.jsx'
import ParticleField from './ParticleField.jsx'

const POINTS = [
  {
    glyph: 'lock',
    title: 'Credentials stay on the PC',
    body: 'They live in your own Excel workbook, on your machine, read at run time. No sync, no account of ours holding a portal password.',
  },
  {
    glyph: 'download_done',
    title: 'It downloads; it never files',
    body: 'Every module is a download path. Nothing is submitted, amended or filed on any portal, by design.',
  },
  {
    glyph: 'travel_explore',
    title: 'Its own browser',
    body: 'A bundled, branded Chrome build kept entirely separate from your personal Chrome — and every process it spawns is swept on exit.',
  },
  {
    glyph: 'verified_user',
    title: 'Signed licence, per machine',
    body: 'Activation is signature-verified against the licence server, and the tool says plainly — with a retry — when it cannot reach it.',
  },
  {
    glyph: 'how_to_reg',
    title: 'Captcha stays human',
    body: "The portal's captcha is shown to you, magnified, with the remaining time on screen. Nothing is guessed and nothing is sent out to be solved.",
  },
  {
    glyph: 'troubleshoot',
    title: 'Failures are measured, not guessed',
    body: 'A network problem writes a local report measuring DNS, TCP, TLS and proxy — so support reads facts instead of a photograph of a dialog.',
  },
]

export default function Security() {
  return (
    <section id="security" className="section section--dark section--glow">
      <ParticleField tone="dark" />
      <div className="wrap wrap--relative">
        <div className="securityhead reveal" data-reveal>
          <div>
            <span className="eyebrow eyebrow--light">03 — SECURITY &amp; DATA PRIVACY</span>
            <h2 className="h2 h2--light">Your clients&#39; logins never leave the office.</h2>
          </div>
          <p className="securityhead__lede">
            TAXI is a desktop application, not a service you upload a client book to. There is no
            cloud store of portal credentials, and nothing about a run is transmitted anywhere except
            the daily check of your trial or licence status.
          </p>
        </div>

        <div className="securitygrid">
          {POINTS.map((p, i) => (
            <div
              key={p.title}
              className="securitycell reveal"
              data-reveal
              style={{ '--d': `${0.05 + i * 0.05}s` }}
            >
              <Icon name={p.glyph} className="securitycell__icon" />
              <h3 className="securitycell__title">{p.title}</h3>
              <p className="securitycell__body">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
