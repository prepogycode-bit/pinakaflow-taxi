import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import Icon from './Icon.jsx'
import { site } from '../site.config.js'
import {
  ACTION_SETS,
  AVATARS,
  CLIENTS,
  FILE_NAMES,
  FRAMES,
  LOG_COLORS,
  MODES,
  MODE_ORDER,
  PILLS,
  STATUS_FILTERS,
  TAG_COLORS,
  statusKeys,
} from '../data/demo.js'

// The three monitors live behind buttons in the top bar, as in the app since
// 5.27: the window is two areas, clients and automation, and nothing else.
const MONITORS = [
  ['activity', 'Activity'],
  ['bots', 'Bots'],
  ['files', 'Downloads'],
]

// The mock is laid out at a fixed 1400px and scaled down to whatever width the
// page gives it, so the proportions never break on a narrow screen.
const DEMO_W = 1400
const FRAME_MS = 1900
// Below this width, stop shrinking the mock (it would be unreadable) and let it
// scroll sideways inside its own box instead.
const NARROW_W = 700
const MIN_SCALE = 0.42

function initialsOf(name) {
  const words = name.split(' ')
  return (words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)).toUpperCase()
}

// The last five log lines, oldest first.
function logTail(frame) {
  const out = []
  for (let i = 4; i >= 0; i--) {
    const idx = frame - i
    if (idx < 0) continue
    const f = FRAMES[idx % FRAMES.length]
    out.push({
      key: idx,
      text: f.log[0],
      level: f.log[1],
      time: '11:' + String(10 + idx).padStart(2, '0'),
    })
  }
  return out
}

// The toast the app raises for this frame, if any.
function toastFor(frame, f, m) {
  if (frame === 1) return { kind: 'info', title: 'Automation started', body: `${m.label} · 4 clients` }
  if (f.pct === 100) return { kind: 'ok', title: 'Run complete', body: `${f.files} files downloaded.` }
  return null
}

export default function LiveDemo() {
  const [frame, setFrame] = useState(0)
  const [mode, setMode] = useState('3B')
  const [filter, setFilter] = useState('all')
  const [panel, setPanel] = useState(null)
  const [scale, setScale] = useState(1)
  const [height, setHeight] = useState(0)

  const wrapRef = useRef(null)
  const innerRef = useRef(null)

  const measure = useCallback(() => {
    const wrap = wrapRef.current
    const inner = innerRef.current
    if (!wrap || !inner) return
    const fit = Math.min(1, wrap.clientWidth / DEMO_W)
    const s = wrap.clientWidth < NARROW_W ? Math.max(fit, MIN_SCALE) : fit
    const h = Math.round(inner.offsetHeight * s)
    setScale((prev) => (Math.abs(prev - s) > 0.002 ? s : prev))
    setHeight((prev) => (Math.abs(prev - h) > 1 ? h : prev))
  }, [])

  // Re-measure after every render (the panel's height changes with the mode)
  // and whenever the window resizes.
  useLayoutEffect(measure)

  useEffect(() => {
    window.addEventListener('resize', measure)
    const raf = requestAnimationFrame(measure)
    // Web fonts land late and change the height - catch that too.
    const late = setTimeout(measure, 400)
    return () => {
      window.removeEventListener('resize', measure)
      cancelAnimationFrame(raf)
      clearTimeout(late)
    }
  }, [measure])

  useEffect(() => {
    const t = setInterval(() => setFrame((f) => (f + 1) % FRAMES.length), FRAME_MS)
    return () => clearInterval(t)
  }, [])

  const f = FRAMES[frame]
  const m = MODES[mode]
  const [pillBg, pillFg, pillDot] = PILLS[f.pill] || PILLS.Ready
  const actionSet = ACTION_SETS[mode]
  const files = FILE_NAMES.slice(0, f.files)
  const running = f.pct > 0 && f.pct < 100
  const toast = toastFor(frame, f, m)
  const navIndex = MODE_ORDER.indexOf(mode)
  const isGst = mode !== 'ITR'
  // GST only: the due / overdue tags and their filters, as in the app.
  const shown = CLIENTS.map((c, i) => [c, i]).filter(
    ([c]) => !isGst || statusKeys(c.tags).has(filter),
  )
  const filterCount = (key) => CLIENTS.filter((c) => statusKeys(c.tags).has(key)).length
  const counts = { activity: frame, bots: running ? 1 : 0, files: f.files }
  const lastLog = logTail(frame).slice(-1)[0]

  // The current tool's two colours drive every tool-coloured surface. They are
  // registered custom properties (see styles.css), so a sidebar click
  // cross-fades the banner, the chip, the Start button and the bar together.
  const accent = { '--h0': m.colors[0], '--h1': m.colors[1] }

  return (
    <div className="demo">
      <span className="demo__caption">
        LIVE &mdash; THE ACTUAL DASHBOARD, MID&#8209;RUN. CLICK A RETURN IN THE SIDEBAR.
      </span>

      <div className="demo__wrap" ref={wrapRef} style={{ height: height ? `${height}px` : 'auto' }}>
        <div className="app" ref={innerRef} style={{ transform: `scale(${scale})`, ...accent }}>
          {/* ---- window title bar ---- */}
          <div className="app__titlebar">
            <img className="app__titleicon" src="./assets/taxi-mark.svg" alt="" />
            <span>TAXI &nbsp;&bull;&nbsp; Compliance Automation Suite</span>
            <span className="app__winbtns">
              <Icon name="minimize" />
              <Icon name="crop_square" />
              <Icon name="close" />
            </span>
          </div>

          <div className="app__frame">
            {/* ---- midnight sidebar ---- */}
            <aside className="app__sidebar">
              <div className="app__brand">
                <img className="app__logo" src="./assets/taxi-mark.svg" alt="" />
                <div className="app__brandtext">
                  <span className="app__brandname">
                    TA<span className="app__x">X</span>I
                  </span>
                  <span className="app__brandsub">Your Co-Driver for Compliance</span>
                </div>
              </div>
              <div className="app__siderule" />

              <div className="app__sidelabel">RETURNS</div>
              <div className="app__nav" style={{ '--i': navIndex }}>
                <span className="app__navind" />
                {MODE_ORDER.map((id) => {
                  const item = MODES[id]
                  const active = id === mode
                  return (
                    <button
                      key={id}
                      type="button"
                      className={`app__navrow${active ? ' is-active' : ''}`}
                      style={{ '--t0': item.colors[0] }}
                      onClick={() => setMode(id)}
                    >
                      <span className="app__navtile">
                        <Icon name={item.glyph} />
                      </span>
                      <span className="app__navtitle">{item.label}</span>
                      <span className="app__navsub">{active ? item.sub : ''}</span>
                    </button>
                  )
                })}
              </div>

              <div className="app__sidelabel app__sidelabel--gap">WORKSPACE</div>
              {[
                ['monitoring', 'Reports'],
                ['settings', 'Settings'],
              ].map(([glyph, label]) => (
                <div key={label} className="app__navrow app__navrow--static">
                  <span className="app__navtile app__navtile--plain">
                    <Icon name={glyph} />
                  </span>
                  <span className="app__navtitle">{label}</span>
                </div>
              ))}

              <div className="app__sidefoot">
                <div className="app__sidefootline">
                  <Icon name="shield" className="app__shield" />
                  <span className="app__sidever">Secure session</span>
                  <span className="app__greendot">&#9679;</span>
                </div>
                <div className="app__sidenote">PinakaFlow TAXI &nbsp;·&nbsp; v{site.version}</div>
              </div>
            </aside>

            {/* ---- content column ---- */}
            <div className="app__content">
              {/* top bar */}
              <div className="app__topbar">
                <span className="app__iconbtn">
                  <Icon name="menu" />
                </span>
                <span className="app__modechip">{m.label}</span>
                <span className="app__divider" />
                <span className="app__status" style={{ background: pillBg, color: pillFg }}>
                  <span
                    className={`app__statusdot${running ? ' is-live' : ''}`}
                    style={{ background: pillDot }}
                  />
                  {f.pill}
                </span>
                <span className="app__selected">4 Selected</span>

                <div className="app__progress">
                  <div className="app__progressrow">
                    <span className="app__stage">{f.stage}</span>
                    <span className="app__key">CLIENT</span>
                    <span className="app__val app__val--client">{f.client}</span>
                    <span className="app__key">LEFT</span>
                    <span className="app__val">{f.left}</span>
                    <span className="app__key">ELAPSED</span>
                    <span className="app__val">{f.elapsed}</span>
                    <span className="app__key">ETA</span>
                    <span className="app__val app__val--last">{f.eta}</span>
                    <span className="app__pct">{f.pct}%</span>
                  </div>
                  <div className="app__bar">
                    <div
                      className={`app__barfill${running ? ' is-live' : ''}`}
                      style={{ width: `${f.pct}%` }}
                    />
                  </div>
                </div>

                <div className="app__topright">
                  {MONITORS.map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      className={`app__monbtn${counts[key] ? ' is-hot' : ''}${
                        panel === key ? ' is-open' : ''
                      }`}
                      onClick={() => setPanel((p) => (p === key ? null : key))}
                    >
                      {label}
                      {counts[key] > 0 && <span className="app__moncount">{counts[key]}</span>}
                    </button>
                  ))}
                  <span className="app__topsep" />
                  <span className="app__credentials">Credentials</span>
                  <span className="app__iconbtn">
                    <Icon name="settings" />
                  </span>
                </div>
              </div>

              {/* a monitor, opened from its top-bar button */}
              {panel && (
                <div className="app__panel" key={panel}>
                  <div className="card__head card__head--tight">
                    <span className="card__icon">
                      <Icon
                        name={
                          panel === 'activity'
                            ? 'monitoring'
                            : panel === 'bots'
                              ? 'smart_toy'
                              : 'content_paste'
                        }
                      />
                    </span>
                    <span className="card__title">
                      {MONITORS.find(([k]) => k === panel)[1]}
                    </span>
                    <button type="button" className="app__panelclose" onClick={() => setPanel(null)}>
                      <Icon name="close" />
                    </button>
                  </div>

                  {panel === 'activity' && (
                    <div className="logbox">
                      {logTail(frame).map((l) => {
                        const [dot, text] = LOG_COLORS[l.level] || LOG_COLORS.INFO
                        return (
                          <div key={l.key} className="logline">
                            <span className="logline__time">{l.time}</span>
                            <span className="logline__dot" style={{ color: dot }}>
                              &#9679;
                            </span>
                            <span className="logline__text" style={{ color: text }}>
                              {l.text}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {panel === 'bots' && (
                    <div className="botlist">
                      {running ? (
                        <div className="botrow">
                          <span className="botrow__dot" />
                          <span className="botrow__name">{f.client}</span>
                          <span className="botrow__state">{f.stage}</span>
                        </div>
                      ) : (
                        <span className="botlist__empty">No active bots.</span>
                      )}
                    </div>
                  )}

                  {panel === 'files' && (
                    <>
                      <div className="filepills">
                        <span className="filepill filepill--done">&#10003; {f.files} Downloaded</span>
                        <span className="filepill filepill--proc">
                          &#9888; {running ? 1 : 0} Processing
                        </span>
                      </div>
                      <div className="filelist">
                        {files.length ? (
                          files.map((name, i) => (
                            <div
                              key={name}
                              className={`filerow${i === files.length - 1 ? ' is-new' : ''}`}
                            >
                              <Icon name="task_alt" className="filerow__icon" />
                              <span className="filerow__name">{name}</span>
                            </div>
                          ))
                        ) : (
                          <span className="botlist__empty">Nothing downloaded yet.</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {toast && (
                <div key={`toast-${frame}`} className={`app__toast app__toast--${toast.kind}`}>
                  <span className="app__toasticon">
                    <Icon name={toast.kind === 'ok' ? 'check' : 'info'} />
                  </span>
                  <span className="app__toasttext">
                    <strong>{toast.title}</strong>
                    <span>{toast.body}</span>
                  </span>
                  <span className="app__toasttimer" />
                </div>
              )}

              {/* workflow */}
              <div className="app__main">
                {/* clients */}
                <div className="card card--clients">
                  <div className="card__head">
                    <span className="card__icon">
                      <Icon name="group" />
                    </span>
                    <span className="card__title">Clients</span>
                    <span className="card__count">4 / 7 selected</span>
                  </div>
                  <div className="card__rule" />
                  <div className="card__bodycol">
                    <div className="searchrow">
                      <div className="field field--search">
                        <Icon name="search" className="field__icon" />
                        Search by name, username or initials
                      </div>
                      {isGst &&
                        STATUS_FILTERS.map(([key, label]) => (
                          <button
                            key={key}
                            type="button"
                            className={`statuschip statuschip--${key}${
                              filter === key ? ' is-on' : ''
                            }`}
                            onClick={() => setFilter(key)}
                          >
                            {label} {filterCount(key)}
                          </button>
                        ))}
                    </div>
                    <div className="selectall">
                      <span className="selectall__box">
                        <Icon name="check" />
                      </span>
                      <span className="selectall__label">Select all</span>
                      {isGst && <span className="selectall__refresh">Update database</span>}
                      <span className={`selectall__refresh${isGst ? ' is-next' : ''}`}>Refresh</span>
                      <span className="selectall__fast">Fast Login</span>
                    </div>
                    <div className="clientlist">
                      {shown.map(([c, i]) => {
                        const [a0, a1] = AVATARS[i % AVATARS.length]
                        const busy = c.sel && c.name === f.client && running
                        const badge = busy ? 'RUNNING' : c.sel && f.pct === 100 ? 'DONE' : ''
                        return (
                          <div key={c.username} className={`clientrow${c.sel ? ' is-selected' : ''}`}>
                            <span className="clientrow__box">
                              {c.sel ? <Icon name="check" /> : ''}
                            </span>
                            <span
                              className="clientrow__avatar"
                              style={{ background: `linear-gradient(135deg, ${a0}, ${a1})` }}
                            >
                              {initialsOf(c.name)}
                            </span>
                            <span className="clientrow__text">
                              <span className="clientrow__name">{c.name}</span>
                              <span className="clientrow__user">{c.username}</span>
                            </span>
                            <span className={`clientrow__badge${busy ? ' is-busy' : ''}`}>
                              {badge}
                            </span>
                            {isGst && (
                              <span className="clientrow__tags">
                                {c.tags.map(([text, kind]) => {
                                  const [bg, fg] = TAG_COLORS[kind]
                                  return (
                                    <span
                                      key={text}
                                      className="duetag"
                                      style={{ background: bg, color: fg }}
                                    >
                                      {text}
                                    </span>
                                  )
                                })}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* right column */}
                <div className="app__rightcol">
                  <div className="app__hero">
                    <span className="app__herotile">
                      <Icon name={m.glyph} />
                    </span>
                    <span className="app__herotext" key={mode}>
                      <span className="app__heroeyebrow">AUTOMATION</span>
                      <span className="app__herotitle">{m.label}</span>
                      <span className="app__herosub">{m.blurb}</span>
                    </span>
                    <span className="app__herochip">4 of 7 selected</span>
                  </div>

                  <div className="card card--pad">
                    <div className="card__head card__head--tight">
                      <span className="card__icon">
                        <Icon name="folder" />
                      </span>
                      <span className="card__title">Output Location</span>
                    </div>
                    <div className="outrow">
                      <div className="field field--path">C:\PinakaFlow TAXI\Downloads</div>
                      <div className="btnfake btnfake--primary">Browse</div>
                    </div>
                  </div>

                  {mode !== 'ITR' && (
                    <div className="card card--pad">
                      <div className="card__head card__head--tight">
                        <span className="card__icon">
                          <Icon name="calendar_month" />
                        </span>
                        <span className="card__title">Return Period</span>
                      </div>
                      <div className="periodrow">
                        {[
                          ['FINANCIAL YEAR', '2025-26', 115],
                          ['QUARTER', 'Q1 (Apr - Jun)', 195],
                          ['MONTH', 'Whole Quarter', 140],
                        ].map(([label, value, w]) => (
                          <div key={label} className="pickfield">
                            <span className="pickfield__label">{label}</span>
                            <div className="pickfield__box" style={{ width: w }}>
                              {value}
                              <Icon name="expand_more" className="pickfield__chev" />
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* No QRMP switch any more: the workbook's mark decides, or
                          TAXI finds out on the portal. */}
                      <div className="checkrow">
                        <span className="checkrow__item">
                          <span className="checkrow__box is-on">
                            <Icon name="check" />
                          </span>
                          Full financial year
                        </span>
                      </div>
                    </div>
                  )}

                  {actionSet && (
                    <div className="card card--pad">
                      <div className="card__head card__head--tight">
                        <span className="card__icon">
                          <Icon name={m.glyph} />
                        </span>
                        <span className="card__title">{actionSet.title}</span>
                      </div>
                      <div className="actionlist">
                        {actionSet.rows.map(([label, desc], i) => (
                          <div key={label} className={`actionrow${i === 0 ? ' is-on' : ''}`}>
                            <span className="actionrow__dot" />
                            <span className="actionrow__text">
                              <span className="actionrow__label">{label}</span>
                              <span className="actionrow__desc">{desc}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="runrow">
                    <div className={`runbtn runbtn--start${running ? ' is-busy' : ''}`}>
                      <Icon name={running ? 'sync' : 'play_arrow'} />
                      {running ? 'Running…' : 'Start automation'}
                    </div>
                    <div className="runbtn runbtn--pause">Pause</div>
                    <div className="runbtn runbtn--stop">Stop</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* status bar */}
          <div className="app__statusbar">
            <span className="app__sbstatus" style={{ color: pillDot }}>
              &#9679;&nbsp; {f.pill}
            </span>
            <span className="app__sbtask">
              {running ? `${m.label}  ·  4 clients` : 'No task running'}
            </span>
            {lastLog && <span className="app__sblast">{lastLog.text}</span>}
            <span className="app__sbbrand">
              <span className="app__sbtaxi">&#9679;</span> PinakaFlow TAXI &nbsp;·&nbsp; v
              {site.version}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
