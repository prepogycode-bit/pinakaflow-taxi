import Icon from './Icon.jsx'
import TypedHeadline from './TypedHeadline.jsx'
import { site } from '../site.config.js'

// The last segment is the one that carries the gradient. Note the non-breaking
// hyphen in "co-driver" — it keeps the word whole when the line wraps.
const HEADLINE = [
  { text: 'Your co‑driver for ', accent: false },
  { text: 'compliance.', accent: true },
]

export default function Hero() {
  return (
    <div className="hero__inner">
      <div className="badge">
        <span className="badge__dot" />
        <span className="badge__text">
          TAXI v{site.version} &nbsp;·&nbsp; WINDOWS 10 / 11 &nbsp;·&nbsp; FOR CA FIRMS
        </span>
      </div>

      <TypedHeadline segments={HEADLINE} className="hero__title" />

      <p className="hero__lede">
        TAXI signs in to the GST and Income Tax portals for every client on your list, downloads
        GSTR&#8209;1, 2B, 3B, ITR and AIS, names each file the way your practice reads it, and
        rebuilds one summary workbook. It runs on your PC — it downloads, it never files.
      </p>

      <div className="hero__actions">
        <a className="btn btn--primary btn--lg" href="#download">
          <Icon name="download" />
          {site.trialLive ? 'Try for free' : 'Download for Windows'}
        </a>
        <a className="btn btn--ghost btn--lg" href="#how">
          <Icon name="play_circle" />
          See how a run works
        </a>
        <span className="hero__meta">
          {site.trialLive && (
            <>
              <span className="live-dot" />
              FREE TRIAL IS LIVE &nbsp;·&nbsp; NO CARD &nbsp;·&nbsp;{' '}
            </>
          )}
          WINDOWS &nbsp;·&nbsp; {site.installerSize}
        </span>
      </div>
    </div>
  )
}
