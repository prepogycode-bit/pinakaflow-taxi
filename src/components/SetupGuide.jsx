import Icon from './Icon.jsx'
import { changelog, site } from '../site.config.js'

const STEPS = [
  [
    'Run the installer.',
    'It installs to its own folder and upgrades in place — an update never leaves two copies behind.',
  ],
  [
    'Open TAXI — no key needed for the trial.',
    'While the free trial is running, TAXI unlocks by itself; it checks this online every day. A paid licence key is activated per machine, and if the check cannot reach the server the dialog has a Try again — no restart needed.',
  ],
  [
    'Nothing else to install.',
    'The browser TAXI drives is inside the installer. No Python, no tools and no first-run download, even on a brand-new PC.',
  ],
  [
    'Fill in the Credentials workbook.',
    'A blank one is waiting in Documents\\TAXI. One row per client, and the Credentials button in the top bar opens it whenever you need it. The user guide is in the Start menu.',
  ],
]

export default function SetupGuide() {
  return (
    <section id="setup" className="section">
      <div className="wrap">
        <div className="setupgrid">
          <div className="reveal" data-reveal>
            <span className="eyebrow">05 — SETUP GUIDE</span>
            <h2 className="h2 h2--sm">New PC? Fifteen minutes, four things.</h2>
            <ol className="setuplist">
              {STEPS.map(([title, body], i) => (
                <li key={title}>
                  <span className="setuplist__num">{String(i + 1).padStart(2, '0')}</span>
                  <span>
                    <strong className="setuplist__title">{title}</strong>
                    <span className="setuplist__body">{body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="reveal" data-reveal style={{ transitionDelay: '0.1s' }}>
            <span className="eyebrow">06 — WHAT&#39;S NEW</span>
            <div className="release">
              <div className="release__head">
                <span className="release__ver">{site.version}</span>
                <span className="release__date">{site.releaseDate} &nbsp;·&nbsp; CURRENT</span>
              </div>
              <ul className="release__list">
                {changelog.map((line) => (
                  <li key={line}>
                    <Icon name="check_small" className="release__tick" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <p className="release__note">
              Trial builds are unsigned while code signing is arranged. The version you download is
              the version this page names.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
