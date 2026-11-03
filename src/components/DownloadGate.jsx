import { useState } from 'react'
import Icon from './Icon.jsx'
import { site } from '../site.config.js'
import { isFirebaseConfigured, saveSignup, signInWithGoogle } from '../firebase.js'

const STEP_DEFS = [
  ['1', 'Sign in'],
  ['2', 'Your details'],
  ['3', 'Download'],
]

// field key -> how it is named back to the visitor in the error line
const REQUIRED = [
  ['name', 'your name'],
  ['mobile', 'a mobile number'],
  ['email', 'an email address'],
  ['firm', 'your firm or company'],
  ['role', 'your role'],
  ['city', 'your city and state'],
  ['source', 'how you heard about TAXI'],
]

const ROLES = [
  'Chartered Accountant',
  'Tax consultant / GST practitioner',
  'Accountant (in-house)',
  'Article / paid assistant',
  'Business owner',
]

const SOURCES = [
  'Another CA or colleague',
  'A WhatsApp or Telegram group',
  'Search',
  'YouTube or a demo video',
  'A seminar or ICAI event',
  'Somewhere else',
]

const EMPTY_FORM = {
  name: '',
  mobile: '',
  email: '',
  firm: '',
  role: '',
  city: '',
  source: '',
}

// "CA Ashutosh Mishra" -> "Ashutosh"
function firstNameOf(fullName) {
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter((w) => !/^(ca|cs|cma|adv|advocate|dr|mr|mrs|ms|shri|smt)\.?$/i.test(w))
  return parts[0] || fullName.trim() || 'there'
}

export default function DownloadGate() {
  const [gate, setGate] = useState(0)
  const [form, setForm] = useState(EMPTY_FORM)
  const [account, setAccount] = useState(null) // { uid, name, email } from Google
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const configured = isFirebaseConfigured()
  const requiresSignIn = site.gateRequiresSignIn !== false
  const effGate = requiresSignIn ? gate : Math.max(gate, 1)

  const set = (key) => (e) => {
    const { value } = e.target
    setForm((f) => ({ ...f, [key]: value }))
    setError('')
  }

  async function handleSignIn() {
    setError('')
    if (!configured) {
      // No Firebase project wired up yet - carry on to the form.
      setGate(1)
      return
    }
    setBusy(true)
    try {
      const user = await signInWithGoogle()
      setAccount(user)
      setForm((f) => ({
        ...f,
        name: f.name || user.name,
        email: f.email || user.email,
      }))
      setGate(1)
    } catch (err) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        setError('Sign-in window was closed before it finished.')
      } else {
        setError('Google sign-in did not go through. Please try again.')
      }
    } finally {
      setBusy(false)
    }
  }

  async function handleSubmit() {
    const missing = REQUIRED.filter(([key]) => !String(form[key]).trim())
    if (missing.length) {
      setError('Please add ' + missing.map(([, label]) => label).join(', ') + '.')
      return
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(form.email.trim())) {
      setError('That email address does not look right.')
      return
    }
    if (form.mobile.replace(/\D/g, '').length < 10) {
      setError('A mobile number needs at least 10 digits.')
      return
    }

    const record = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      googleUid: account?.uid || null,
      googleEmail: account?.email || null,
      appVersion: site.version,
    }

    setBusy(true)
    setError('')
    try {
      if (configured) {
        await saveSignup(record)
      } else {
        // Local mode - keep the details in the browser so nothing is lost while
        // Firebase is still being set up.
        const stored = JSON.parse(localStorage.getItem('taxi.signups') || '[]')
        stored.push({ ...record, createdAt: new Date().toISOString() })
        localStorage.setItem('taxi.signups', JSON.stringify(stored))
      }
      setGate(2)
    } catch (err) {
      console.error('Sign-up could not be saved:', err)
      setError('We could not save your details just now. Please try again in a moment.')
    } finally {
      setBusy(false)
    }
  }

  function reset() {
    setGate(0)
    setForm(EMPTY_FORM)
    setAccount(null)
    setError('')
  }

  const hasInstaller = Boolean(site.installerUrl)

  return (
    <section id="download" className="section section--tint section--glow">
      <div className="download-glow" />
      <div className="wrap wrap--relative">
        <div className="downloadgrid">
          <div className="reveal" data-reveal>
            <span className="eyebrow">04 — DOWNLOAD</span>
            <h2 className="h2">
              {site.trialLive ? 'Free trial is live. Try TAXI for free.' : 'Get TAXI.'}
            </h2>
            <p className="lede lede--tight">
              Sign in, tell us who is using it, and the installer link appears on this page
              immediately. We ask so that support knows your setup before you need it.
            </p>

            <div className="sysreq">
              <span className="mono-label">SYSTEM REQUIREMENTS</span>
              <ul className="sysreq__list">
                <li>
                  <Icon name="check_small" className="sysreq__tick" />
                  Windows 10 or 11, 64-bit
                </li>
                <li>
                  <Icon name="check_small" className="sysreq__tick" />4 GB RAM, ~1 GB free disk
                  (the browser comes inside the installer)
                </li>
                <li>
                  <Icon name="check_small" className="sysreq__tick" />
                  Excel, for the client and credentials workbook
                </li>
                <li>
                  <Icon name="check_small" className="sysreq__tick" />
                  An internet connection — TAXI checks its trial or licence status daily
                </li>
              </ul>
            </div>
          </div>

          <div className="gate reveal" data-reveal style={{ transitionDelay: '0.1s' }}>
            <div className="gate__steps">
              {STEP_DEFS.map(([num, label], i) => {
                const done = effGate > i
                const here = effGate === i
                return (
                  <div key={label} className="gate__step">
                    <span
                      className={`gate__chip${done ? ' is-done' : here ? ' is-here' : ''}`}
                    >
                      {done ? '✓' : num}
                    </span>
                    <span className={`gate__steplabel${here ? ' is-here' : ''}`}>{label}</span>
                    {i < 2 && <span className={`gate__rail${done ? ' is-done' : ''}`} />}
                  </div>
                )
              })}
            </div>

            <div className="gate__body">
              {effGate === 0 && (
                <div>
                  <h3 className="gate__title">Sign in to continue</h3>
                  <p className="gate__text">
                    One account carries your download and your support history. No password to
                    invent.
                  </p>
                  <button
                    type="button"
                    className="gate__google"
                    onClick={handleSignIn}
                    disabled={busy}
                  >
                    <span className="gate__googlemark" />
                    {busy ? 'Opening Google…' : 'Continue with Google'}
                  </button>
                  {error && (
                    <div className="gate__error">
                      <Icon name="error" />
                      <span>{error}</span>
                    </div>
                  )}
                  <p className="gate__fineprint">
                    We read your name and email address only. By continuing you accept the trial
                    terms and the privacy notice.
                  </p>
                  {!configured && import.meta.env.DEV && (
                    <p className="gate__devnote">
                      Dev note: Firebase is not configured yet (src/firebase.js), so sign-in is
                      skipped and sign-ups are kept in this browser only.
                    </p>
                  )}
                </div>
              )}

              {effGate === 1 && (
                <div>
                  {account && (
                    <div className="gate__signedin">
                      <Icon name="check_circle" />
                      <span>
                        Signed in with Google — <strong>{account.email}</strong>
                      </span>
                    </div>
                  )}
                  <h3 className="gate__title gate__title--gap">Who will be using TAXI?</h3>
                  <p className="gate__text gate__text--sm">
                    Seven fields. All required — this is the record support works from.
                  </p>

                  <div className="formgrid">
                    <label className="formfield">
                      <span className="formfield__label">FULL NAME</span>
                      <input
                        type="text"
                        value={form.name}
                        onChange={set('name')}
                        placeholder="CA Ashutosh Mishra"
                      />
                    </label>
                    <label className="formfield">
                      <span className="formfield__label">MOBILE</span>
                      <input
                        type="tel"
                        value={form.mobile}
                        onChange={set('mobile')}
                        placeholder="+91 98765 43210"
                      />
                    </label>
                    <label className="formfield">
                      <span className="formfield__label">EMAIL</span>
                      <input
                        type="email"
                        value={form.email}
                        onChange={set('email')}
                        placeholder="you@firm.in"
                      />
                    </label>
                    <label className="formfield">
                      <span className="formfield__label">FIRM / COMPANY</span>
                      <input
                        type="text"
                        value={form.firm}
                        onChange={set('firm')}
                        placeholder="Mishra & Co."
                      />
                    </label>
                    <label className="formfield">
                      <span className="formfield__label">ROLE</span>
                      <select value={form.role} onChange={set('role')}>
                        <option value="">Select…</option>
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="formfield">
                      <span className="formfield__label">CITY &amp; STATE</span>
                      <input
                        type="text"
                        value={form.city}
                        onChange={set('city')}
                        placeholder="Kolkata, West Bengal"
                      />
                    </label>
                  </div>

                  <label className="formfield formfield--full">
                    <span className="formfield__label">HOW YOU HEARD ABOUT TAXI</span>
                    <select value={form.source} onChange={set('source')}>
                      <option value="">Select…</option>
                      {SOURCES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>

                  {error && (
                    <div className="gate__error">
                      <Icon name="error" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    className="gate__submit"
                    onClick={handleSubmit}
                    disabled={busy}
                  >
                    <Icon name="lock_open" />
                    {busy ? 'Saving…' : 'Unlock the download'}
                  </button>
                </div>
              )}

              {effGate === 2 && (
                <div>
                  <div className="gate__doneline">
                    <span className="gate__donetick">
                      <Icon name="check" />
                    </span>
                    <h3 className="gate__title">Ready, {firstNameOf(form.name)}.</h3>
                  </div>
                  <p className="gate__text">
                    Download the ZIP below, run the installer and open TAXI. No licence key is
                    needed for the free trial — it switches on by itself while the trial is
                    running.
                  </p>

                  <a
                    className={`installer${hasInstaller ? '' : ' is-disabled'}`}
                    href={hasInstaller ? site.installerUrl : undefined}
                    onClick={hasInstaller ? undefined : (e) => e.preventDefault()}
                  >
                    <Icon name="install_desktop" className="installer__icon" />
                    <span className="installer__text">
                      <span className="installer__name">{site.installerName}</span>
                      <span className="installer__meta">
                        WINDOWS 64-BIT &nbsp;·&nbsp; {site.installerSize} &nbsp;·&nbsp; v
                        {site.version}
                      </span>
                    </span>
                    <Icon name="download" className="installer__arrow" />
                  </a>

                  {!hasInstaller && (
                    <p className="installer__pending">
                      The download link goes live with the next release — we have your details and
                      will email you the moment it does.
                    </p>
                  )}

                  <div className="donenotes">
                    <div>
                      <Icon name="shield" />
                      Unsigned build — Windows may warn on first run. Choose{' '}
                      <strong>More info → Run anyway</strong>.
                    </div>
                    <div>
                      <Icon name="inventory_2" />
                      The ZIP holds the installer, a blank Credentials workbook and the user guide —
                      nothing else to download.
                    </div>
                  </div>

                  <button type="button" className="gate__reset" onClick={reset}>
                    Use a different account
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
