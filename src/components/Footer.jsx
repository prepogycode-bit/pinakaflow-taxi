import { site } from '../site.config.js'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer__inner">
        <img className="footer__brand" src="./assets/pinakaflow-logo-dark.webp" alt="PinakaFlow" />
        <span className="footer__text">
          Products:{' '}
          <a className="footer__link" href="#taxi">
            TAXI {site.version}
          </a>{' '}
          — GST &amp; ITR compliance automation ·{' '}
          <a className="footer__link" href="#ledgerx">
            LedgerX
          </a>{' '}
          — your books, into Tally
        </span>
        <span className="footer__meta">
          {site.siteDomain} &nbsp;·&nbsp; © {new Date().getFullYear()} PINAKAFLOW
        </span>
      </div>
    </footer>
  )
}
