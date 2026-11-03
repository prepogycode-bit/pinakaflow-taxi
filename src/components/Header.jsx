import Icon from './Icon.jsx'
import { ledgerx, site } from '../site.config.js'

const NAV = {
  taxi: [
    ['#automates', 'What it automates'],
    ['#how', 'How it works'],
    ['#security', 'Security'],
    ['#setup', 'Setup guide'],
  ],
  ledgerx: [
    ['#ledgerx', 'Overview'],
    ['#ledgerx-features', 'Features'],
  ],
}

const PRODUCTS = [
  {
    id: 'taxi',
    href: '#taxi',
    logo: './assets/taxi-mark.svg',
    name: (
      <>
        TA<span className="site-header__x">X</span>I
      </>
    ),
    label: 'PinakaFlow TAXI',
  },
  {
    id: 'ledgerx',
    href: '#ledgerx',
    logo: './assets/ledgerx-mark.png',
    name: (
      <>
        Ledger<span className="product-tab__lxx">X</span>
      </>
    ),
    label: 'PinakaFlow LedgerX',
  },
]

function toTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export default function Header({ product }) {
  const lxHref =
    ledgerx.downloadUrl ||
    `mailto:${site.supportEmail}?subject=${encodeURIComponent('LedgerX for my firm')}`

  // Two rows: the PinakaFlow logo on its own band (scrolls away), and below
  // it the bar with the product tabs and menu, which stays pinned on scroll.
  return (
    <>
      <div className="pf-top">
        <div className="pf-top__inner">
          <a className="pf-brand" href="#taxi" aria-label="PinakaFlow — home" onClick={toTop}>
            <img
              className="pf-brand__logo"
              src="./assets/pinakaflow-logo-dark.webp"
              alt="PinakaFlow"
            />
          </a>
        </div>
      </div>
    <header className={`site-header site-header--${product}`}>
      <div className="site-header__inner">
        <div className="product-switch" aria-label="PinakaFlow products">
          {PRODUCTS.map((p) => (
            <a
              key={p.id}
              href={p.href}
              className={`product-tab product-tab--${p.id}${product === p.id ? ' is-on' : ''}`}
              aria-current={product === p.id ? 'page' : undefined}
              aria-label={p.label}
              onClick={product === p.id ? toTop : undefined}
            >
              <img className="product-tab__logo" src={p.logo} alt="" />
              <span className="product-tab__name">{p.name}</span>
            </a>
          ))}
        </div>
        <nav className="site-nav">
          {NAV[product].map(([href, label]) => (
            <a key={href} className="site-nav__link" href={href}>
              {label}
            </a>
          ))}
          {product === 'taxi' ? (
            <a className="btn btn--primary btn--sm" href="#download">
              <Icon name="download" />
              Download
            </a>
          ) : (
            <a className="btn btn--lx btn--sm" href={lxHref}>
              <Icon name={ledgerx.downloadUrl ? 'download' : 'mail'} />
              {ledgerx.downloadUrl ? 'Download' : 'Ask for LedgerX'}
            </a>
          )}
        </nav>
      </div>
    </header>
    </>
  )
}
