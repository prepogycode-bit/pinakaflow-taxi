import { useEffect, useMemo, useState } from 'react'
import Icon from './Icon.jsx'
import {
  addGoogleAdmin,
  addPasswordAdmin,
  changeMyPassword,
  deleteSignup,
  emailToAdminId,
  isFirebaseConfigured,
  removeAdmin,
  signInWithGoogle,
  signInWithPassword,
  signOutAdmin,
  updateSignup,
  watchAdmins,
  watchAuth,
  watchSignups,
} from '../firebase.js'

// Built into the Firestore rules, so the panel can never be locked out.
const OWNER_EMAILS = ['ashumuzak47@gmail.com']

const AUTH_ERRORS = {
  'auth/invalid-credential': 'That user ID or password is not right.',
  'auth/wrong-password': 'That user ID or password is not right.',
  'auth/user-not-found': 'That user ID or password is not right.',
  'auth/invalid-email': 'That user ID is not valid.',
  'auth/too-many-requests': 'Too many tries. Wait a few minutes and try again.',
  'auth/email-already-in-use': 'That user ID is already taken. Choose another.',
  'auth/weak-password': 'The password needs at least 8 characters.',
  'auth/operation-not-allowed': 'User ID sign-in is not switched on in Firebase yet.',
  'auth/requires-recent-login': 'Sign out and in again, then retry.',
  'permission-denied': 'Only an admin can do that.',
}
const authError = (err, fallback) => AUTH_ERRORS[err?.code] || fallback

// The enquiry workflow. A record with no status yet is a new one.
const STATUSES = [
  ['new', 'New'],
  ['contacted', 'Contacted'],
  ['trial', 'Trial running'],
  ['customer', 'Customer'],
  ['lost', 'Not interested'],
]
const STATUS_LABEL = Object.fromEntries(STATUSES)

const CSV_COLUMNS = [
  ['createdAt', 'Date'],
  ['status', 'Status'],
  ['name', 'Name'],
  ['mobile', 'Mobile'],
  ['email', 'Email'],
  ['firm', 'Firm'],
  ['role', 'Role'],
  ['city', 'City & state'],
  ['source', 'Heard via'],
  ['notes', 'Notes'],
  ['googleEmail', 'Google account'],
  ['appVersion', 'TAXI version'],
]

const statusOf = (r) => r.status || 'new'

function fmtDate(d) {
  if (!d) return '—'
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ago(d) {
  if (!d) return ''
  const s = (Date.now() - d.getTime()) / 1000
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`
  const days = Math.floor(s / 86400)
  return days === 1 ? 'yesterday' : `${days} days ago`
}

// "98765 43210" -> "919876543210" for wa.me
function whatsappNumber(mobile) {
  const d = String(mobile || '').replace(/\D/g, '')
  if (d.length === 10) return '91' + d
  if (d.length === 11 && d.startsWith('0')) return '91' + d.slice(1)
  return d
}

function exportCsv(rows) {
  const esc = (v) => {
    const s = v instanceof Date ? fmtDate(v) : String(v ?? '')
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [
    CSV_COLUMNS.map(([, h]) => h).join(','),
    ...rows.map((r) =>
      CSV_COLUMNS.map(([k]) => esc(k === 'status' ? STATUS_LABEL[statusOf(r)] : r[k])).join(',')
    ),
  ]
  const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `PinakaFlow enquiries ${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

function Notes({ row }) {
  const [text, setText] = useState(row.notes || '')
  const [state, setState] = useState('')

  useEffect(() => setText(row.notes || ''), [row.notes])

  async function save() {
    if (text === (row.notes || '')) return
    setState('Saving…')
    try {
      await updateSignup(row.id, { notes: text })
      setState('Saved')
      setTimeout(() => setState(''), 1500)
    } catch {
      setState('Not saved — try again')
    }
  }

  return (
    <label className="adm-notes">
      <span className="adm-notes__label">
        NOTES {state && <em className="adm-notes__state">{state}</em>}
      </span>
      <textarea
        value={text}
        rows={2}
        placeholder="Called on…, wants a demo for 40 clients…"
        onChange={(e) => setText(e.target.value)}
        onBlur={save}
      />
    </label>
  )
}

function EnquiryCard({ row }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const st = statusOf(row)
  const wa = whatsappNumber(row.mobile)

  async function setStatus(e) {
    setBusy(true)
    try {
      await updateSignup(row.id, { status: e.target.value })
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!window.confirm(`Delete the enquiry from ${row.name || 'this person'}? This cannot be undone.`))
      return
    await deleteSignup(row.id)
  }

  return (
    <article className={`adm-card adm-card--${st}`}>
      <div className="adm-card__main">
        <div className="adm-card__who">
          <div className="adm-card__name">
            {row.name || 'No name'}
            {st === 'new' && <span className="adm-badge">NEW</span>}
          </div>
          <div className="adm-card__firm">
            {[row.firm, row.role].filter(Boolean).join(' · ') || '—'}
          </div>
          <div className="adm-card__meta">
            <Icon name="location_on" /> {row.city || '—'}
            <span className="adm-dot">·</span>
            <Icon name="campaign" /> {row.source || '—'}
          </div>
        </div>

        <div className="adm-card__contact">
          {row.mobile && (
            <div className="adm-card__line">
              <span className="adm-mono">{row.mobile}</span>
              <a className="adm-icon-btn" href={`tel:${row.mobile.replace(/\s/g, '')}`} title="Call">
                <Icon name="call" />
              </a>
              {wa && (
                <a
                  className="adm-icon-btn adm-icon-btn--wa"
                  href={`https://wa.me/${wa}`}
                  target="_blank"
                  rel="noreferrer"
                  title="WhatsApp"
                >
                  <Icon name="chat" />
                </a>
              )}
            </div>
          )}
          {row.email && (
            <div className="adm-card__line">
              <a className="adm-link" href={`mailto:${row.email}`}>
                {row.email}
              </a>
            </div>
          )}
        </div>

        <div className="adm-card__side">
          <select
            className={`adm-status adm-status--${st}`}
            value={st}
            onChange={setStatus}
            disabled={busy}
            aria-label="Status"
          >
            {STATUSES.map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
          <div className="adm-card__date" title={fmtDate(row.createdAt)}>
            {fmtDate(row.createdAt)}
            <small>{ago(row.createdAt)}</small>
          </div>
        </div>
      </div>

      <Notes row={row} />

      <div className="adm-card__foot">
        <button type="button" className="adm-text-btn" onClick={() => setOpen((o) => !o)}>
          <Icon name={open ? 'expand_less' : 'expand_more'} />
          {open ? 'Less' : 'More details'}
        </button>
        <button type="button" className="adm-text-btn adm-text-btn--danger" onClick={remove}>
          <Icon name="delete" />
          Delete
        </button>
      </div>

      {open && (
        <dl className="adm-details">
          <dt>Google account</dt>
          <dd>{row.googleEmail || '—'}</dd>
          <dt>TAXI version shown</dt>
          <dd>{row.appVersion || '—'}</dd>
          <dt>Last changed</dt>
          <dd>{fmtDate(row.updatedAt)}</dd>
          <dt>Browser</dt>
          <dd className="adm-details__ua">{row.userAgent || '—'}</dd>
        </dl>
      )}
    </article>
  )
}

function PasswordSignIn() {
  const [id, setId] = useState('')
  const [pw, setPw] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(e) {
    e.preventDefault()
    if (!id.trim() || !pw) return setError('Enter your user ID and password.')
    setBusy(true)
    setError('')
    try {
      await signInWithPassword(id, pw)
    } catch (err) {
      setError(authError(err, 'Sign-in did not go through. Please try again.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="adm-form" onSubmit={submit}>
      <input
        className="adm-input"
        value={id}
        onChange={(e) => setId(e.target.value)}
        placeholder="User ID"
        autoComplete="username"
        autoCapitalize="off"
      />
      <input
        className="adm-input"
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        placeholder="Password"
        autoComplete="current-password"
      />
      <button type="submit" className="btn btn--ghost-dark btn--lg" disabled={busy}>
        <Icon name="key" />
        {busy ? 'Signing in…' : 'Sign in with user ID'}
      </button>
      {error && <p className="adm-error">{error}</p>}
    </form>
  )
}

function ChangePassword() {
  const [cur, setCur] = useState('')
  const [next, setNext] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (next.length < 8) return setMsg('The new password needs at least 8 characters.')
    setBusy(true)
    setMsg('')
    try {
      await changeMyPassword(cur, next)
      setCur('')
      setNext('')
      setMsg('Password changed.')
    } catch (err) {
      setMsg(authError(err, 'The password could not be changed.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="adm-panel" onSubmit={submit}>
      <h2 className="adm-h2">My password</h2>
      <div className="adm-row">
        <input
          className="adm-input"
          type="password"
          value={cur}
          onChange={(e) => setCur(e.target.value)}
          placeholder="Current password"
          autoComplete="current-password"
        />
        <input
          className="adm-input"
          type="password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          placeholder="New password (8+ characters)"
          autoComplete="new-password"
        />
        <button type="submit" className="btn btn--ghost-dark btn--sm" disabled={busy}>
          Change
        </button>
      </div>
      {msg && <p className={msg === 'Password changed.' ? 'adm-ok' : 'adm-error'}>{msg}</p>}
    </form>
  )
}

function AdminsTab({ user }) {
  const [admins, setAdmins] = useState(null)
  const [kind, setKind] = useState('password')
  const [form, setForm] = useState({ email: '', userId: '', name: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    let off = () => {}
    watchAdmins(setAdmins, () => setAdmins([])).then((u) => (off = u))
    return () => off()
  }, [])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function add(e) {
    e.preventDefault()
    setMsg('')
    if (kind === 'google') {
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(form.email.trim()))
        return setMsg('Enter the Google account email address.')
    } else {
      if (!/^[a-z0-9._-]{3,30}$/i.test(form.userId.trim()))
        return setMsg('User ID: 3–30 letters, numbers, dots, dashes or underscores.')
      if (form.password.length < 8) return setMsg('The password needs at least 8 characters.')
    }
    setBusy(true)
    try {
      if (kind === 'google') await addGoogleAdmin(form.email, form.name)
      else await addPasswordAdmin(form.userId, form.name, form.password)
      setForm({ email: '', userId: '', name: '', password: '' })
      setMsg(
        kind === 'google'
          ? 'Added. They sign in with the Google button.'
          : 'Added. Share the user ID and password with them privately.'
      )
    } catch (err) {
      setMsg(authError(err, 'The admin could not be added.'))
    } finally {
      setBusy(false)
    }
  }

  async function remove(a) {
    const who = a.name || a.userId || a.email
    if (!window.confirm(`Remove ${who} as an admin? They lose access at once.`)) return
    try {
      await removeAdmin(a.id)
    } catch (err) {
      setMsg(authError(err, 'The admin could not be removed.'))
    }
  }

  const isMe = (a) => a.uid === user.uid || (a.kind === 'google' && a.email === user.email)

  return (
    <div className="adm-stack">
      <section className="adm-panel">
        <h2 className="adm-h2">Admins</h2>
        <div className="adm-admins">
          {OWNER_EMAILS.map((e) => (
            <div key={e} className="adm-admin">
              <Icon name="shield_person" />
              <div>
                <strong>{e}</strong>
                <small>Owner · Google · built in, cannot be removed</small>
              </div>
            </div>
          ))}
          {(admins || []).map((a) => (
            <div key={a.id} className="adm-admin">
              <Icon name={a.kind === 'google' ? 'account_circle' : 'badge'} />
              <div>
                <strong>
                  {a.name || (a.kind === 'google' ? a.email : a.userId)}
                  {isMe(a) && <span className="adm-badge adm-badge--me">YOU</span>}
                </strong>
                <small>
                  {a.kind === 'google' ? `Google · ${a.email}` : `User ID · ${a.userId}`}
                  {a.addedBy ? ` · added by ${emailToAdminId(a.addedBy)}` : ''}
                  {a.addedAt ? ` on ${fmtDate(a.addedAt).split(',')[0]}` : ''}
                </small>
              </div>
              {!isMe(a) && (
                <button
                  type="button"
                  className="adm-text-btn adm-text-btn--danger"
                  onClick={() => remove(a)}
                >
                  <Icon name="person_remove" />
                  Remove
                </button>
              )}
            </div>
          ))}
          {admins === null && <p className="adm-sub">Loading…</p>}
        </div>
      </section>

      <form className="adm-panel" onSubmit={add}>
        <h2 className="adm-h2">Add an admin</h2>
        <div className="adm-chips">
          <button
            type="button"
            className={`adm-chip${kind === 'password' ? ' is-on' : ''}`}
            onClick={() => setKind('password')}
          >
            User ID &amp; password
          </button>
          <button
            type="button"
            className={`adm-chip${kind === 'google' ? ' is-on' : ''}`}
            onClick={() => setKind('google')}
          >
            Google account
          </button>
        </div>
        <div className="adm-row">
          <input
            className="adm-input"
            value={form.name}
            onChange={set('name')}
            placeholder="Name (optional)"
          />
          {kind === 'google' ? (
            <input
              className="adm-input"
              value={form.email}
              onChange={set('email')}
              placeholder="Google email, e.g. name@gmail.com"
              autoCapitalize="off"
            />
          ) : (
            <>
              <input
                className="adm-input"
                value={form.userId}
                onChange={set('userId')}
                placeholder="User ID, e.g. ravi"
                autoCapitalize="off"
                autoComplete="off"
              />
              <input
                className="adm-input"
                type="password"
                value={form.password}
                onChange={set('password')}
                placeholder="Password (8+ characters)"
                autoComplete="new-password"
              />
            </>
          )}
          <button type="submit" className="btn btn--primary btn--sm" disabled={busy}>
            <Icon name="person_add" />
            {busy ? 'Adding…' : 'Add admin'}
          </button>
        </div>
        {msg && <p className={msg.startsWith('Added') ? 'adm-ok' : 'adm-error'}>{msg}</p>}
      </form>

      {user.provider === 'password' && <ChangePassword />}
    </div>
  )
}

export default function AdminPanel() {
  const [user, setUser] = useState(undefined) // undefined = still checking
  const [rows, setRows] = useState(null)
  const [denied, setDenied] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('enquiries')

  useEffect(() => {
    document.title = 'PinakaFlow Admin'
    // Dev server only (stripped from the build): made-up enquiries for layout checks.
    if (import.meta.env.DEV && window.location.search.includes('admindemo')) {
      setUser({ uid: 'demo', name: 'Demo', email: 'admin@example.com' })
      return
    }
    if (!isFirebaseConfigured()) return
    let off = () => {}
    watchAuth(setUser).then((u) => (off = u))
    return () => off()
  }, [])

  useEffect(() => {
    setRows(null)
    setDenied(false)
    if (!user) return
    if (import.meta.env.DEV && user.uid === 'demo') {
      const d = (h) => new Date(Date.now() - h * 3600 * 1000)
      setRows([
        { id: '1', name: 'CA Riya Sharma', firm: 'Sharma & Associates', role: 'Chartered Accountant', city: 'Jaipur, Rajasthan', source: 'Another CA or colleague', mobile: '98765 43210', email: 'riya@example.com', createdAt: d(2) },
        { id: '2', name: 'Amit Verma', firm: 'Verma Tax Consultants', role: 'Tax consultant / GST practitioner', city: 'Pune, Maharashtra', source: 'YouTube or a demo video', mobile: '9123456780', email: 'amit@example.com', status: 'contacted', notes: 'Called, wants a demo for 60 clients.', createdAt: d(30) },
        { id: '3', name: 'Neha Gupta', firm: 'Gupta Traders', role: 'Business owner', city: 'Lucknow, UP', source: 'Search', mobile: '9988776655', email: 'neha@example.com', status: 'customer', createdAt: d(200) },
      ])
      return
    }
    let off = () => {}
    watchSignups(setRows, (err) => {
      if (err?.code === 'permission-denied') setDenied(true)
      else setError('The enquiries could not be loaded. Check your connection and reload.')
    }).then((u) => (off = u))
    return () => off()
  }, [user])

  const counts = useMemo(() => {
    const c = { all: rows?.length || 0 }
    for (const [k] of STATUSES) c[k] = 0
    for (const r of rows || []) c[statusOf(r)] += 1
    return c
  }, [rows])

  const weekCount = useMemo(() => {
    const since = Date.now() - 7 * 86400 * 1000
    return (rows || []).filter((r) => r.createdAt && r.createdAt.getTime() >= since).length
  }, [rows])

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (rows || []).filter((r) => {
      if (filter !== 'all' && statusOf(r) !== filter) return false
      if (!q) return true
      return [r.name, r.firm, r.email, r.mobile, r.city, r.role, r.source, r.notes]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    })
  }, [rows, filter, search])

  async function signIn() {
    setError('')
    try {
      await signInWithGoogle()
    } catch (err) {
      if (err?.code !== 'auth/popup-closed-by-user') setError('Google sign-in did not go through.')
    }
  }

  const signedIn = user && !denied

  const shell = (body) => (
    <div className="adm">
      <header className="adm-top">
        <a className="adm-top__brand" href="#taxi">
          <img src="./assets/pinakaflow-logo-dark.webp" alt="PinakaFlow" />
          <b>Admin</b>
        </a>
        {signedIn && (
          <nav className="adm-tabs">
            {[
              ['enquiries', 'Enquiries', 'inbox'],
              ['admins', 'Admins', 'group'],
            ].map(([k, l, i]) => (
              <button
                key={k}
                type="button"
                className={`adm-tab${tab === k ? ' is-on' : ''}`}
                onClick={() => setTab(k)}
              >
                <Icon name={i} />
                {l}
              </button>
            ))}
          </nav>
        )}
        {user && (
          <div className="adm-top__user">
            <span>{user.provider === 'password' ? emailToAdminId(user.email) : user.email}</span>
            <button type="button" className="adm-text-btn" onClick={signOutAdmin}>
              <Icon name="logout" />
              Sign out
            </button>
          </div>
        )}
      </header>
      {body}
    </div>
  )

  if (!isFirebaseConfigured()) {
    return shell(<div className="adm-gate">Firebase is not configured (src/firebase.js).</div>)
  }

  if (user === undefined) return shell(<div className="adm-gate">Checking sign-in…</div>)

  if (!user || denied) {
    return shell(
      <div className="adm-gate">
        <div className="adm-gate__card">
          <Icon name="admin_panel_settings" />
          <h1>PinakaFlow Admin</h1>
          {denied ? (
            <p>
              <strong>
                {user.provider === 'password' ? emailToAdminId(user.email) : user.email}
              </strong>{' '}
              is not an admin. Sign out and sign in with an admin account.
            </p>
          ) : (
            <p>Sign in to see and manage the website enquiries.</p>
          )}
          {denied ? (
            <button type="button" className="btn btn--primary btn--lg" onClick={signOutAdmin}>
              <Icon name="logout" />
              Sign out
            </button>
          ) : (
            <>
              <button type="button" className="btn btn--primary btn--lg adm-wide" onClick={signIn}>
                <Icon name="login" />
                Sign in with Google
              </button>
              <div className="adm-or">
                <span>or</span>
              </div>
              <PasswordSignIn />
            </>
          )}
          {error && <p className="adm-error">{error}</p>}
        </div>
      </div>
    )
  }

  if (tab === 'admins') {
    return shell(
      <main className="adm-body">
        <AdminsTab user={user} />
      </main>
    )
  }

  return shell(
    <main className="adm-body">
      <div className="adm-head">
        <div>
          <h1 className="adm-title">Enquiries</h1>
          <p className="adm-sub">Trial sign-ups from pinakaflow.in, live as they arrive.</p>
        </div>
        <button
          type="button"
          className="btn btn--ghost-dark btn--sm"
          onClick={() => exportCsv(shown)}
          disabled={!shown.length}
        >
          <Icon name="download" />
          Export {shown.length} to Excel (CSV)
        </button>
      </div>

      <div className="adm-stats">
        {[
          ['Total', counts.all, 'inbox'],
          ['New — not contacted', counts.new, 'mark_email_unread'],
          ['This week', weekCount, 'calendar_today'],
          ['Customers', counts.customer, 'verified'],
        ].map(([label, n, icon]) => (
          <div key={label} className="adm-stat">
            <Icon name={icon} />
            <strong>{rows ? n : '–'}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="adm-tools">
        <div className="adm-chips">
          {[['all', 'All'], ...STATUSES].map(([k, l]) => (
            <button
              key={k}
              type="button"
              className={`adm-chip adm-chip--${k}${filter === k ? ' is-on' : ''}`}
              onClick={() => setFilter(k)}
            >
              {l} <span>{counts[k] ?? 0}</span>
            </button>
          ))}
        </div>
        <label className="adm-search">
          <Icon name="search" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, firm, mobile, city, notes…"
          />
        </label>
      </div>

      {error && <p className="adm-error">{error}</p>}

      {rows === null ? (
        <div className="adm-empty">Loading enquiries…</div>
      ) : shown.length === 0 ? (
        <div className="adm-empty">
          {rows.length ? 'No enquiry matches this filter.' : 'No enquiries yet.'}
        </div>
      ) : (
        <div className="adm-list">
          {shown.map((r) => (
            <EnquiryCard key={r.id} row={r} />
          ))}
        </div>
      )}
    </main>
  )
}
