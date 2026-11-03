import { useEffect, useLayoutEffect, useState } from 'react'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import LiveDemo from './components/LiveDemo.jsx'
import ParticleField from './components/ParticleField.jsx'
import Automates from './components/Automates.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import Security from './components/Security.jsx'
import DownloadGate from './components/DownloadGate.jsx'
import SetupGuide from './components/SetupGuide.jsx'
import LedgerX from './components/LedgerX.jsx'
import AdminPanel from './components/AdminPanel.jsx'
import SupportBar from './components/SupportBar.jsx'
import Footer from './components/Footer.jsx'
import { useReveal } from './hooks/useReveal.js'
import { site } from './site.config.js'

// Which product page is showing is kept in the address (#ledgerx...), so a
// link, a bookmark and the Back button all land on the right one.
// #admin is the enquiries panel: not linked anywhere, guarded by sign-in and
// the Firestore rules.
const productOf = () => {
  const h = window.location.hash
  if (h === '#admin') return 'admin'
  return h.startsWith('#ledgerx') ? 'ledgerx' : 'taxi'
}

const TITLES = {
  taxi: 'PinakaFlow TAXI — GST & ITR Compliance Automation',
  ledgerx: 'PinakaFlow LedgerX — Bank statements, purchases and GSTR-2B into Tally',
}

export default function App() {
  const [product, setProduct] = useState(productOf)

  useEffect(() => {
    const onHash = () => setProduct(productOf())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // After a switch the browser's own jump to the #anchor happened before the
  // page held that section, so it is redone here: the section if it exists,
  // else the top.
  useLayoutEffect(() => {
    if (product === 'admin') {
      window.scrollTo(0, 0)
      return
    }
    document.title = TITLES[product]
    const id = window.location.hash.slice(1)
    const target = id && document.getElementById(id)
    if (!target || id === 'ledgerx') {
      window.scrollTo(0, 0)
      return
    }
    target.scrollIntoView()
    // The page above it is still growing (demo, images), so aim once more
    // when that has settled.
    const t = setTimeout(() => target.scrollIntoView({ behavior: 'smooth' }), 450)
    return () => clearTimeout(t)
  }, [product])

  useReveal(product)

  if (product === 'admin') return <AdminPanel />

  return (
    <div className={`page page--${product}`}>
      <Header product={product} />
      {product === 'taxi' ? (
        <>
          <section className="hero">
            <div className="hero-glow" />
            <div className="hero-grid" />
            <ParticleField tone="dark" />
            <Hero />
            {site.showLiveDemo && <LiveDemo />}
          </section>
          <Automates />
          <HowItWorks />
          <Security />
          <DownloadGate />
          <SetupGuide />
          <SupportBar />
        </>
      ) : (
        <LedgerX standalone />
      )}
      <Footer />
    </div>
  )
}
